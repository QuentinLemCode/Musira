import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Music as MusicInterface } from './music.interface';
import { Queue } from './queue/queue.entity';

@Entity()
export class Music implements MusicInterface {
  @Column()
  artist: string;

  @Column()
  title: string;

  @Column()
  album: string;

  @PrimaryColumn()
  uri: `spotify:track:${string}`;

  @Column()
  cover: string;

  @Column()
  duration: number;

  @OneToMany(() => Queue, (queue) => queue.music)
  queue: Queue[];

  toString(): string {
    return `${this.artist} - ${this.title}`;
  }
}
