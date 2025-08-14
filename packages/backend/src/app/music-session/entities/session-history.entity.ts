import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { User } from '../../users/user.entity';
import type { MusicSession } from './music-session.entity';

@Entity()
@Index(['user', 'music_session'], { unique: true })
export class SessionHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne('User', { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @ManyToOne('MusicSession', { onDelete: 'CASCADE' })
  @JoinColumn()
  music_session: MusicSession;

  @BeforeInsert()
  setJoinDate() {
    this.joined_at = new Date();
  }

  @Column({ type: 'datetime' })
  joined_at: Date;
}
