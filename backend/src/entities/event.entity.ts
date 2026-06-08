import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Registration } from './registration.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({
    type: 'enum',
    enum: ['Academic', 'Workshop', 'Social', 'Career', 'Sports'],
    default: 'Academic',
  })
  category: string;

  @Column({ default: 'public' })
  visibility: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  imageUrl: string;

  @Column({ type: 'datetime' })
  startDate: Date;

  @Column({ type: 'datetime' })
  endDate: Date;

  @Column({ default: 'on-campus' })
  locationType: string;

  @Column()
  location: string;

  @Column({ type: 'int', default: 0 })
  capacity: number;

  @Column({ type: 'date', nullable: true })
  registrationDeadline: Date | null;

  @Column({ default: false })
  requireApproval: boolean;

  @Column({
    type: 'enum',
    enum: ['active', 'draft', 'past', 'completed'],
    default: 'draft',
  })
  status: string;

  @Column({ type: 'int', default: 0 })
  registeredCount: number;

  @ManyToOne(() => User, (user) => user.events)
  @JoinColumn({ name: 'organizerId' })
  organizer: User;

  @Column()
  organizerId: number;

  @OneToMany(() => Registration, (reg) => reg.event)
  registrations: Registration[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
