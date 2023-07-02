import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MusicSession } from '../entities/music-session.entity';

@Entity()
export class Settings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 3 })
  maxVotes: number;

  @Column({ default: 5 })
  maxQueuableSongPerUser: number;

  @OneToOne(() => MusicSession, (music_session) => music_session.settings)
  music_session: MusicSession;
}
