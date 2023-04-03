import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Queue } from '../../music/queue/queue.entity';
import { User } from '../../users/user.entity';

@Entity()
export class MusicSession {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column()
  name: string;

  @OneToOne(() => User)
  @JoinColumn()
  creator: User;

  @ManyToMany(() => User, { cascade: true })
  @JoinTable()
  participants: User[];

  @OneToMany(() => Queue, (queue) => queue.music_session)
  queued_musics: Queue[];
}
