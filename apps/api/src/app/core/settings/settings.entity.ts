import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Settings {
  @PrimaryColumn()
  id: number;

  @Column({ default: 3 })
  maxVotes: number;

  @Column({ default: 5 })
  maxQueuableSongPerUser: number;
}
