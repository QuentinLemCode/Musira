import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Music } from '../music.entity';

export enum Status {
  PENDING,
  PLAYING,
  FINISHED,
  CANCELLED,
  BACKLOG,
}

@Entity()
export class Backlog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Music, (music) => music.queue, { cascade: true })
  music: Music;

  @BeforeUpdate()
  updateDates() {
    this.updated_at = new Date();
  }

  @BeforeInsert()
  insertDates() {
    this.updated_at = new Date();
    this.created_at = new Date();
  }

  @Column({
    type: 'datetime',
  })
  public created_at: Date;

  @Column({
    type: 'datetime',
  })
  public updated_at: Date;

  @DeleteDateColumn({
    precision: null,
    type: 'timestamp',
    default: () => null,
  })
  deleted_at: Date;

  @Column({ type: 'int', default: 0 })
  play_count: number;
}
