import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MusicDto {
  @ApiProperty()
  artist: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  album: string;

  @ApiProperty({ description: 'Spotify track URI' })
  uri: string;

  @ApiPropertyOptional({ description: 'Cover image URL' })
  cover?: string;

  @ApiProperty()
  duration: number;
}
