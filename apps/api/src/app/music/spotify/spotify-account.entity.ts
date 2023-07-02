import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MusicSession } from '../../music-session/entities/music-session.entity';

@Entity()
export class SpotifyAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  access_token: string;

  @Column({ nullable: true })
  token_type: string;

  @Column({ nullable: true })
  scope: string;

  @Column({ nullable: true })
  expires_in: number;

  @Column({ nullable: true })
  refresh_token: string;

  @Column({ type: 'bigint', nullable: true })
  expires_at: number;

  @OneToOne(
    () => MusicSession,
    (music_session) => music_session.spotify_account,
    {
      eager: true,
    },
  )
  music_session: MusicSession;
}
