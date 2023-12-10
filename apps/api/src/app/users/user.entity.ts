import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  TableInheritance,
} from 'typeorm';
import { MusicSession } from '../music-session/entities/music-session.entity.js';
import { Queue } from '../music/queue/queue.entity.js';

export enum UserRole {
  ADMIN = 1,
  USER = 0,
}

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class User {
  @BeforeUpdate()
  updateDates() {
    this.updated_at = new Date();
  }

  @BeforeInsert()
  insertDates() {
    this.updated_at = new Date();
    this.created_at = new Date();
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  @Index({ unique: true })
  name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ type: 'datetime' })
  public created_at: Date;

  @Column({ type: 'datetime' })
  public updated_at: Date;

  @OneToMany(() => Queue, (queue) => queue.user)
  queued_musics: Queue[];

  @ManyToMany(() => Queue, (queue) => queue.forward_vote_users, {
    cascade: true,
  })
  forward_votes_music: Queue[];

  @ManyToMany(() => MusicSession, (session) => session.participants)
  session_participation: MusicSession[];

  @OneToMany(() => MusicSession, (session) => session.creator)
  sessionCreated: Promise<MusicSession[]>;

  @RelationId((user: User) => user.sessionCreated)
  sessionCreatedIds: number[];
}
