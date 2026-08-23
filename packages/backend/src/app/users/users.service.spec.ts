import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { hashPassword } from '../utils/hash';
import { EmailUser } from './user.email.entity';
import { User } from './user.entity';
import { OAuthUser } from './user.oauth.entity';
import { MAX_LOGIN_TRIES, UsersService } from './users.service';

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

  describe('emailLogin', () => {
    const login = { email: 'john@example.com', password: 'wrong' };

    it('should return null when user does not exist', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      const result = await service.emailLogin(login);

      expect(result).toBeNull();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should return null without checking credentials when account is locked', async () => {
      const lockedUser = new EmailUser();
      lockedUser.locked = true;
      mockRepository.findOneBy.mockResolvedValue(lockedUser);

      const result = await service.emailLogin(login);

      expect(result).toBeNull();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should increment loginTries on failed password', async () => {
      const user = new EmailUser();
      user.salt = 'salt';
      user.password = hashPassword('correct', 'salt');
      user.loginTries = 0;
      user.locked = false;
      mockRepository.findOneBy.mockResolvedValue(user);

      const result = await service.emailLogin(login);

      expect(result).toBeNull();
      expect(user.loginTries).toBe(1);
      expect(user.locked).toBe(false);
      expect(mockRepository.save).toHaveBeenCalledWith(user);
    });

    it('should lock the account after MAX_LOGIN_TRIES failures', async () => {
      const user = new EmailUser();
      user.salt = 'salt';
      user.password = hashPassword('correct', 'salt');
      user.loginTries = MAX_LOGIN_TRIES - 1;
      user.locked = false;
      mockRepository.findOneBy.mockResolvedValue(user);

      const result = await service.emailLogin(login);

      expect(result).toBeNull();
      expect(user.loginTries).toBe(MAX_LOGIN_TRIES);
      expect(user.locked).toBe(true);
    });

    it('should reset loginTries on successful login', async () => {
      const user = new EmailUser();
      user.salt = 'salt';
      user.password = hashPassword('correct', 'salt');
      user.loginTries = 2;
      user.locked = false;
      mockRepository.findOneBy.mockResolvedValue(user);

      const result = await service.emailLogin({
        email: 'john@example.com',
        password: 'correct',
      });

      expect(result).toBe(user);
      expect(user.loginTries).toBe(0);
      expect(user.locked).toBe(false);
    });
  });
});
