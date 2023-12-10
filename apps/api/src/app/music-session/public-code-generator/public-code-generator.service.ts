import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MusicSession } from '../entities/music-session.entity.js';

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
      const session = await this.musicSession.findOneBy({ publicCode });
      if (session === null) return publicCode;
    }
    throw new Error('Could not generate public code');
  }

  private generateRandomNumber() {
    const chars = '0123456789';
    const buffer: string[] = [];

    for (let i = 0; i < this.publicCodeLength; i++) {
      buffer.push(chars[Math.floor(Math.random() * chars.length)] || '0');
    }

    const result = Number.parseInt(buffer.join(''), 10);
    if (result.toString().length < this.publicCodeLength) {
      return Number.parseInt(
        result.toString().padEnd(this.publicCodeLength, '0'),
        10,
      );
    }
    return result;
  }
}
