import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  Max,
  Min,
} from 'class-validator';

export class SettingsQueryDto {
  @ApiProperty({ minimum: 1, maximum: 100, default: 3 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  maxVotes!: number;

  @ApiProperty({ minimum: 1, maximum: 50, default: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsNotEmpty()
  maxQueuableSongPerUser!: number;
}
