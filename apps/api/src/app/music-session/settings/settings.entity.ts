import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MusicSession } from '../entities/music-session.entity';

@Entity()
export class Settings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { default: 3 })
  maxVotes: number;

  @Column('int', { default: 5 })
  maxQueuableSongPerUser: number;

  @OneToOne(() => MusicSession, (music_session) => music_session.settings, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  music_session: MusicSession;
}
