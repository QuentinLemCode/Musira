import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Matches } from 'class-validator';

export class MusicDto {
  @ApiProperty()
  @IsString()
  artist: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  album: string;

  @ApiProperty({ description: 'Spotify track URI' })
  @IsString()
  @Matches(/^spotify:track:[A-Za-z0-9]+$/, {
    message: 'uri must be a Spotify track uri',
  })
  uri: string;

  @ApiPropertyOptional({ description: 'Cover image URL' })
  @IsOptional()
  @IsString()
  cover?: string;

  @ApiProperty()
  @IsNumber()
  duration: number;
}
