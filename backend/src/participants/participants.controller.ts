import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { ParticipantsService } from './participants.service';
import { RegistrationsService } from '../registrations/registrations.service';
import { JwtAuthGuard } from '../auth/guards';
import type { Response } from 'express';

@Controller('participants')
export class ParticipantsController {
  constructor(
    private participantsService: ParticipantsService,
    private registrationsService: RegistrationsService,
  ) {}

  @Get('event/:eventId')
  @UseGuards(JwtAuthGuard)
  async getParticipants(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Query('search') search?: string,
  ) {
    return this.participantsService.getParticipantsByEvent(eventId, { search });
  }

  @Get('event/:eventId/stats')
  @UseGuards(JwtAuthGuard)
  async getEventStats(@Param('eventId', ParseIntPipe) eventId: number) {
    return this.participantsService.getEventStats(eventId);
  }

  @Post(':id/checkin')
  @UseGuards(JwtAuthGuard)
  async checkIn(@Param('id', ParseIntPipe) id: number) {
    return this.registrationsService.checkIn(id);
  }

  @Get('event/:eventId/export')
  @UseGuards(JwtAuthGuard)
  async exportCSV(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Res() res: Response,
  ) {
    const participants =
      await this.participantsService.getParticipantsByEvent(eventId);

    const headers = [
      'ID',
      'Name',
      'Email',
      'Department',
      'Student ID',
      'Status',
      'Checked In',
      'Registration Date',
    ];
    const csvRows = participants.map(
      (p) =>
        `${p.id},"${p.fullName}","${p.email}","${p.department}","${p.studentId}",${p.status},${p.checkedIn},${p.createdAt.toISOString().split('T')[0]}`,
    );
    const csvContent = [headers.join(','), ...csvRows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=participants_event_${eventId}.csv`,
    );
    res.send(csvContent);
  }
}
