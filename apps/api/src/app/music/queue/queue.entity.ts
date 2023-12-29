import {
  BeforeInsert,
  BeforeSoftRemove,
  BeforeUpdate,
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import type { MusicSession } from '../../music-session/entities/music-session.entity';
import type { User } from '../../users/user.entity';
import type { Music } from '../music.entity';

export enum Status {
  PENDING,
  PLAYING,
  FINISHED,
  CANCELLED,
}

@Entity()
export class Queue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    default: Status.PENDING,
  })
  status: Status = Status.PENDING;

  @ManyToOne('Music', 'queue', { cascade: true })
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

  @BeforeSoftRemove()
  updateStatus() {
    this.status = Status.CANCELLED;
  }

  @DeleteDateColumn({
    precision: null,
    type: 'timestamp',
    default: () => null,
  })
  deleted_at: Date;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @ManyToOne('User', 'queued_musics', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToMany('User', 'forward_votes_music', {
    onDelete: 'CASCADE',
  })
  @JoinTable()
  forward_vote_users: User[];

  @ManyToOne('MusicSession', 'queued_musics', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'musicSessionId' })
  music_session: Relation<MusicSession>;

  @Column({ type: 'int', nullable: false, default: 0 })
  priority: number;

  play() {
    this.status = Status.PLAYING;
  }

  finish() {
    this.status = Status.FINISHED;
  }

  isPlaying() {
    return this.status === Status.PLAYING;
  }

  isFinished() {
    return this.status === Status.FINISHED;
  }

  isCancelled() {
    return this.status === Status.CANCELLED;
  }

  isPending() {
    return this.status === Status.PENDING;
  }
}
