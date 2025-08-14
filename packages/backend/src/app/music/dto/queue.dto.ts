import { ApiProperty } from '@nestjs/swagger';
import { MusicDto } from './music.dto';

export class UserLightDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}

export class QueueDto {
  @ApiProperty()
  id: number;

  @ApiProperty({
    enum: [0, 1, 2, 3],
    description: '0=PENDING, 1=PLAYING, 2=FINISHED, 3=CANCELLED',
  })
  status: number;

  @ApiProperty({ type: () => MusicDto })
  music: MusicDto;

  @ApiProperty({ type: () => UserLightDto })
  user: UserLightDto;

  @ApiProperty()
  forward_votes: number;
}

export class QueueResponseDto {
  @ApiProperty({ type: () => [QueueDto] })
  queue: QueueDto[];

  @ApiProperty({ type: () => BacklogDto, nullable: true })
  backlog: BacklogDto | null;
}

export class BacklogDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ type: () => MusicDto })
  music: MusicDto;
}
