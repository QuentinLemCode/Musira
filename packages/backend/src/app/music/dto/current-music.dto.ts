import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MusicDto } from './music.dto';
import { QueueDto } from './queue.dto';

export class CurrentMusicDto {
  @ApiProperty()
  isSpotifyAccountRegistered: boolean;

  @ApiPropertyOptional({ type: () => MusicDto, nullable: true })
  currentPlay?: MusicDto | null;

  @ApiPropertyOptional({ type: () => [QueueDto] })
  queue?: QueueDto[];

  @ApiProperty()
  engineStarted: boolean;

  @ApiPropertyOptional({ nullable: true })
  message?: string | undefined;
}
