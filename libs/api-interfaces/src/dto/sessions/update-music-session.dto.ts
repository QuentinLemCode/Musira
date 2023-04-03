import { PartialType } from '@nestjs/mapped-types';
import { CreateMusicSessionDto } from './create-music-session.dto';

export class UpdateMusicSessionDto extends PartialType(CreateMusicSessionDto) {
  constructor(public name: string) {
    super();
  }
}
