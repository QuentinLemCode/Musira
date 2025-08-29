import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MusicDto } from './music.dto';

export class BacklogDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ type: () => MusicDto })
  music: MusicDto;
}

export class FullBacklogDto extends BacklogDto {
  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiPropertyOptional({ nullable: true })
  deleted_at: Date | null;

  @ApiProperty()
  play_count: number;
}

export class ImportResultDto {
  @ApiProperty()
  added: number;
}
