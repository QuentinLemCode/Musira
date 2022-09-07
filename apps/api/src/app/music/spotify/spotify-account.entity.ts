import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class SpotifyAccount {
  @PrimaryColumn()
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
}
