import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Event } from './event.entity';

@Entity('registrations')
export class Registration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  ticketId: string;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  studentId: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  department: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({
    type: 'enum',
    enum: ['confirmed', 'waitlisted', 'pending', 'validated'],
    default: 'pending',
  })
  status: string;

  @Column({ default: false })
  checkedIn: boolean;

  @Column({ type: 'datetime', nullable: true })
  checkedInAt: Date;

  @ManyToOne(() => User, (user) => user.registrations)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userId: number;

  @ManyToOne(() => Event, (event) => event.registrations)
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column()
  eventId: number;

  @CreateDateColumn()
  createdAt: Date;
}
