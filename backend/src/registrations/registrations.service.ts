import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Registration } from '../entities/registration.entity';
import { Event } from '../entities/event.entity';
import { CreateRegistrationDto } from './registrations.dto';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(Registration)
    private registrationRepository: Repository<Registration>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async register(
    userId: number | null,
    dto: CreateRegistrationDto,
  ): Promise<Registration> {
    const event = await this.eventRepository.findOne({
      where: { id: dto.eventId },
    });
    if (!event) throw new NotFoundException('Event not found');

    // Check capacity
    if (event.capacity > 0 && event.registeredCount >= event.capacity) {
      // Waitlist
      const registration = this.registrationRepository.create({
        ...dto,
        userId: userId ?? undefined,
        ticketId: `CP-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'waitlisted',
      });
      return this.registrationRepository.save(registration);
    }

    // Check if already registered
    if (userId) {
      const existing = await this.registrationRepository.findOne({
        where: { userId, eventId: dto.eventId },
      });
      if (existing) {
        throw new BadRequestException('Already registered for this event');
      }
    }

    const status = event.requireApproval ? 'pending' : 'confirmed';

    const registration = this.registrationRepository.create({
      ...dto,
      userId: userId ?? undefined,
      ticketId: `CP-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      status,
    });

    const saved = await this.registrationRepository.save(registration);

    // Update registered count
    await this.eventRepository.update(dto.eventId, {
      registeredCount: event.registeredCount + 1,
    });

    return saved;
  }

  async findByUser(userId: number): Promise<Registration[]> {
    return this.registrationRepository.find({
      where: { userId },
      relations: { event: { organizer: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async findByEvent(eventId: number): Promise<Registration[]> {
    return this.registrationRepository.find({
      where: { eventId },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Registration> {
    const reg = await this.registrationRepository.findOne({
      where: { id },
      relations: { event: true },
    });
    if (!reg) throw new NotFoundException('Registration not found');
    return reg;
  }

  async cancel(id: number): Promise<void> {
    const reg = await this.findOne(id);
    const event = await this.eventRepository.findOne({
      where: { id: reg.eventId },
    });
    await this.registrationRepository.remove(reg);
    if (event && event.registeredCount > 0) {
      await this.eventRepository.update(event.id, {
        registeredCount: event.registeredCount - 1,
      });
    }
  }

  async checkIn(id: number): Promise<Registration> {
    const reg = await this.findOne(id);
    reg.checkedIn = true;
    reg.checkedInAt = new Date();
    reg.status = 'validated';
    return this.registrationRepository.save(reg);
  }
}
