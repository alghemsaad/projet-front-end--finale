import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Registration } from '../entities/registration.entity';
import { Event } from '../entities/event.entity';

@Injectable()
export class ParticipantsService {
  constructor(
    @InjectRepository(Registration)
    private registrationRepository: Repository<Registration>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async getParticipantsByEvent(eventId: number, query?: { search?: string }) {
    const qb = this.registrationRepository
      .createQueryBuilder('reg')
      .where('reg.eventId = :eventId', { eventId });

    if (query?.search) {
      qb.andWhere('(reg.fullName LIKE :search OR reg.studentId LIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    qb.orderBy('reg.createdAt', 'ASC');
    return qb.getMany();
  }

  async getEventStats(eventId: number) {
    const total = await this.registrationRepository.count({
      where: { eventId },
    });
    const checkedIn = await this.registrationRepository.count({
      where: { eventId, checkedIn: true },
    });
    const pending = await this.registrationRepository.count({
      where: { eventId, checkedIn: false },
    });

    return { total, checkedIn, pending };
  }
}
