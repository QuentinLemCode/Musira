import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MusicSession } from '../entities/music-session.entity';

@Injectable()
export class PublicCodeGeneratorService {
  private readonly publicCodeLength = 9;
  constructor(
    @InjectRepository(MusicSession)
    private readonly musicSession: Repository<MusicSession>,
  ) {}

  async generatePublicCode(): Promise<number> {
    for (let i = 0; i < 10; i++) {
      const publicCode = this.generateRandomNumber();
      // const session = await this.musicSessionService.findOneByPublicCode(
      //   publicCode,
      // );
      const session = await this.musicSession.findOneBy({ publicCode });
      if (session === null) return publicCode;
    }
    throw new Error('Could not generate public code');
  }

  private generateRandomNumber() {
    const floor = Math.pow(10, this.publicCodeLength - 1);
    const ceil = Math.pow(10, this.publicCodeLength) - 1;
    return Math.floor(floor + Math.random() * ceil);
  }
}
