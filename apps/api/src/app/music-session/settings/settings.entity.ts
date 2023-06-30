import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { MusicSession } from '../entities/music-session.entity';

@Entity()
export class Settings {
  @PrimaryColumn()
  id: number;

  @Column({ default: 3 })
  maxVotes: number;

  @Column({ default: 5 })
  maxQueuableSongPerUser: number;

  @OneToOne(() => MusicSession, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'musicSessionId' })
  music_session: MusicSession;
}
