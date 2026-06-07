import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParticipantsController } from './participants.controller';
import { ParticipantsService } from './participants.service';
import { Registration } from '../entities/registration.entity';
import { Event } from '../entities/event.entity';
import { AuthModule } from '../auth/auth.module';
import { RegistrationsModule } from '../registrations/registrations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Registration, Event]),
    AuthModule,
    RegistrationsModule,
  ],
  controllers: [ParticipantsController],
  providers: [ParticipantsService],
})
export class ParticipantsModule {}
