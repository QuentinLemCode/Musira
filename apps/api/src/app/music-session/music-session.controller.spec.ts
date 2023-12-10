import { CreateMusicSessionDto } from '@musira/api-interfaces/sessions/create-music-session.dto';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service.js';
import { MusicSession } from './entities/music-session.entity.js';
import { MusicSessionController } from './music-session.controller.js';
import { MusicSessionService } from './music-session.service.js';
import { JwtService } from '../users/jwt/jwt.service.js';

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
      const jwtPayload = { email: 'user@example.com' };
      mockUsersService.findByEmail.mockResolvedValue({ id: 1 });
      mockSessionService.create.mockResolvedValue({
        creator: { name: 'test' },
        name: 'toto',
      });

      const result = await controller.create(createDto, jwtPayload);

      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return an array of music sessions', async () => {
      const musicSessions: MusicSession[] = []; // Provide mock music sessions
      mockSessionService.findAll.mockResolvedValue(musicSessions);

      const result = await controller.findAll();

      expect(result).toEqual(expect.any(Array));
      expect(result.length).toBe(musicSessions.length);
    });
  });
});
