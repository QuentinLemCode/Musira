import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmailUser } from './user.email.entity';
import { User } from './user.entity';
import { OAuthUser } from './user.oauth.entity';
import { UsersService } from './users.service';

// Mocking Repositories
const mockRepository = {
  findOne: jest.fn(),
  findOneOrFail: jest.fn(),
  findOneBy: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;
  // let usersRepository: Repository<User>;
  // let emailUsersRepository: Repository<EmailUser>;
  // let socialUsersRepository: Repository<SocialLoginUser>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(EmailUser),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(OAuthUser),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    // usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    // emailUsersRepository = module.get<Repository<EmailUser>>(
    //   getRepositoryToken(EmailUser),
    // );
    // socialUsersRepository = module.get<Repository<SocialLoginUser>>(
    //   getRepositoryToken(SocialLoginUser),
    // );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('find', () => {
    it('should find a user by name', async () => {
      const name = 'john';
      const user = new User();
      mockRepository.findOne.mockResolvedValue(user);

      const result = await service.find(name);

      expect(result).toBe(user);
    });

    // Write more test cases for different scenarios
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      const userId = 1;
      const user = new User();
      mockRepository.findOneBy.mockResolvedValue(user);

      const result = await service.findById(userId);

      expect(result).toBe(user);
    });

    // Write more test cases for different scenarios
  });

  // Write similar test cases for other methods
});
