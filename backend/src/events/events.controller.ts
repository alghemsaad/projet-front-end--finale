import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './events.dto';
import { JwtAuthGuard } from '../auth/guards';

interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

interface RequestWithUser extends Express.Request {
  user: JwtPayload;
}

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get()
  async findAll(
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.eventsService.findAll({ status, category, search });
  }

  @Get('public')
  async findPublic(
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.eventsService.findPublic({ category, search });
  }

  @Get('organizer')
  @UseGuards(JwtAuthGuard)
  async findByOrganizer(
    @Req() req: RequestWithUser,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.eventsService.findByOrganizer(req.user.userId, {
      status,
      search,
    });
  }

  @Get('organizer/stats')
  @UseGuards(JwtAuthGuard)
  async getOrganizerStats(@Req() req: RequestWithUser) {
    return this.eventsService.getOrganizerStats(req.user.userId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: RequestWithUser, @Body() dto: CreateEventDto) {
    return this.eventsService.create(req.user.userId, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.remove(id);
  }
}
