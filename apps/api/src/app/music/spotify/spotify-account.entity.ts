import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MusicSession } from '../../music-session/entities/music-session.entity';

@Entity()
export class SpotifyAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { nullable: true })
  access_token: string;

  @Column('varchar', { nullable: true })
  token_type: string;

  @Column('varchar', { nullable: true })
  scope: string;

  @Column('int', { nullable: true })
  expires_in: number;

  @Column('varchar', { nullable: true })
  refresh_token: string;

  @Column({ type: 'bigint', nullable: true })
  expires_at: number;

  @OneToOne(
    () => MusicSession,
    (music_session) => music_session.spotify_account,
    {
      eager: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn()
  music_session: MusicSession;
}
