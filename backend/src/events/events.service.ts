import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../entities/event.entity';
import { CreateEventDto, UpdateEventDto } from './events.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async create(organizerId: number, dto: CreateEventDto): Promise<Event> {
    const event = this.eventRepository.create({
      ...dto,
      organizerId,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      registrationDeadline: dto.registrationDeadline
        ? new Date(dto.registrationDeadline)
        : undefined,
    });
    return this.eventRepository.save(event);
  }

  async findAll(query?: {
    status?: string;
    category?: string;
    search?: string;
  }): Promise<Event[]> {
    const qb = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.organizer', 'organizer');

    if (query?.status && query.status !== 'All') {
      qb.andWhere('event.status = :status', {
        status: query.status.toLowerCase(),
      });
    }
    if (query?.category && query.category !== 'All') {
      qb.andWhere('event.category = :category', { category: query.category });
    }
    if (query?.search) {
      qb.andWhere('(event.title LIKE :search OR event.location LIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    qb.orderBy('event.startDate', 'ASC');
    return qb.getMany();
  }

  async findByOrganizer(
    organizerId: number,
    query?: { status?: string; search?: string },
  ): Promise<Event[]> {
    const qb = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .where('event.organizerId = :organizerId', { organizerId });

    if (query?.status && query.status !== 'All') {
      qb.andWhere('event.status = :status', {
        status: query.status.toLowerCase(),
      });
    }
    if (query?.search) {
      qb.andWhere('(event.title LIKE :search OR event.location LIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    qb.orderBy('event.startDate', 'DESC');
    return qb.getMany();
  }

  async findPublic(query?: {
    category?: string;
    search?: string;
  }): Promise<Event[]> {
    const qb = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .where('event.visibility = :visibility', { visibility: 'public' })
      .andWhere('event.status = :status', { status: 'active' });

    if (query?.category && query.category !== 'All') {
      qb.andWhere('event.category = :category', { category: query.category });
    }
    if (query?.search) {
      qb.andWhere('(event.title LIKE :search OR event.location LIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    qb.orderBy('event.startDate', 'ASC');
    return qb.getMany();
  }

  async findOne(id: number): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: { organizer: true },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async update(id: number, dto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(id);
    const { startDate, endDate, registrationDeadline, ...rest } = dto;
    Object.assign(event, rest);
    if (startDate) event.startDate = new Date(startDate);
    if (endDate) event.endDate = new Date(endDate);
    if (registrationDeadline)
      event.registrationDeadline = new Date(registrationDeadline);

    return this.eventRepository.save(event);
  }

  async remove(id: number): Promise<void> {
    const event = await this.findOne(id);
    await this.eventRepository.remove(event);
  }

  async getOrganizerStats(organizerId: number) {
    const events = await this.eventRepository.find({
      where: { organizerId },
    });

    const totalRegistrations = events.reduce(
      (sum, e) => sum + e.registeredCount,
      0,
    );
    const activeEvents = events.filter((e) => e.status === 'active').length;
    const pendingReviews = events.filter((e) => e.status === 'draft').length;
    const engagementScore =
      events.length > 0
        ? Math.round(
            events.reduce(
              (sum, e) =>
                sum +
                (e.capacity > 0 ? (e.registeredCount / e.capacity) * 100 : 0),
              0,
            ) / events.length,
          )
        : 0;

    return {
      totalRegistrations,
      activeEvents,
      pendingReviews,
      engagementScore,
      totalEvents: events.length,
    };
  }
}
