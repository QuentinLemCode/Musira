import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import type { CreateMusicSessionDto, JwtUser } from '../auth/types';
import { UsersService } from '../users/users.service';
import { MusicSession } from './entities/music-session.entity';
import { MusicSessionController } from './music-session.controller';
import { MusicSessionService } from './music-session.service';

// Mocking MusicSessionService
const mockSessionService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

// Mocking UsersService
const mockUsersService = {
  findByEmail: jest.fn(),
};

const mockJwt = {
  validateToken: jest.fn(),
};

describe('MusicSessionController', () => {
  let controller: MusicSessionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MusicSessionController],
      providers: [
        { provide: MusicSessionService, useValue: mockSessionService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    controller = module.get<MusicSessionController>(MusicSessionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a music session', async () => {
      const createDto: CreateMusicSessionDto = {
        name: 'toto',
      }; // Provide valid DTO here
      const request = { user: { email: 'user@example.com' } as JwtUser };
      mockUsersService.findByEmail.mockResolvedValue({ id: 1 });
      mockSessionService.create.mockResolvedValue({
        creator: { name: 'test' },
        name: 'toto',
      });

      const result = await controller.create(createDto, request);

      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return an array of music sessions', async () => {
      const musicSessions: MusicSession[] = []; // Provide mock music sessions
      mockSessionService.findAll.mockResolvedValue(musicSessions);

      const result = await controller.findAll({ user: { id: 1 } as JwtUser });

      expect(result).toEqual(expect.any(Array));
      expect(result.length).toBe(musicSessions.length);
    });
  });
});
