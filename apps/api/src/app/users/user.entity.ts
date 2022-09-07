import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Queue } from '../music/queue/queue.entity';

export enum UserRole {
  ADMIN = 1,
  USER = 0,
}

@Entity()
export class User {
  @BeforeUpdate()
  updateDates() {
    this.updated_at = new Date();
  }

  @BeforeInsert()
  insertDates() {
    this.updated_at = new Date();
    this.created_at = new Date();
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index({ unique: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  @Index({ unique: true })
  ip: string | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'bool',
    default: false,
  })
  noIPverification: boolean;

  @Column({ type: 'datetime' })
  public created_at: Date;

  @Column({ type: 'datetime' })
  public updated_at: Date;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  password: string | null;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  salt: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  challenge: string | null;

  @Column({
    default: 0,
  })
  loginTries: number;

  @Column({
    default: false,
  })
  locked: boolean;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  refresh_token_id: string | null;

  @OneToMany(() => Queue, (queue) => queue.user)
  queued_musics: Queue[];

  @ManyToMany(() => Queue, (queue) => queue.forward_vote_users)
  forward_votes_music: Queue[];
}
