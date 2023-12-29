import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import type { Music as MusicInterface } from './music.interface';
import type { Queue } from './queue/queue.entity';

@Entity()
export class Music implements MusicInterface {
  @Column('varchar')
  artist: string;

  @Column('varchar')
  title: string;

  @Column('varchar')
  album: string;

  @PrimaryColumn('varchar')
  uri: `spotify:track:${string}`;

  @Column('varchar')
  cover: string;

  @Column('varchar')
  duration: number;

  @OneToMany('Queue', 'music')
  queue: Queue[];

  toString(): string {
    return `${this.artist} - ${this.title}`;
  }
}
