import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto } from './registrations.dto';
import { JwtAuthGuard } from '../auth/guards';

interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

interface RequestWithUser extends Express.Request {
  user: JwtPayload;
}

@Controller('registrations')
export class RegistrationsController {
  constructor(private registrationsService: RegistrationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async register(
    @Req() req: RequestWithUser,
    @Body() dto: CreateRegistrationDto,
  ) {
    return this.registrationsService.register(req.user.userId, dto);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async findMyRegistrations(@Req() req: RequestWithUser) {
    return this.registrationsService.findByUser(req.user.userId);
  }

  @Get('event/:eventId')
  @UseGuards(JwtAuthGuard)
  async findByEvent(@Param('eventId', ParseIntPipe) eventId: number) {
    return this.registrationsService.findByEvent(eventId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.registrationsService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async cancel(@Param('id', ParseIntPipe) id: number) {
    await this.registrationsService.cancel(id);
    return { message: 'Registration cancelled' };
  }

  @Post(':id/checkin')
  @UseGuards(JwtAuthGuard)
  async checkIn(@Param('id', ParseIntPipe) id: number) {
    return this.registrationsService.checkIn(id);
  }
}
