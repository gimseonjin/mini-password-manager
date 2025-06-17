import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import {
  InvalidPasswordError,
  UserAlreadyExistsError,
  UserNotFoundError,
} from './user.exception';
import { hashValue } from '../util/bcrypt.util';

const mockUserRepository = {
  save: jest.fn().mockImplementation(async (user) => ({
    ...user,
    id: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
  })),

  existsBy: jest.fn().mockImplementation(async ({ email }) => {
    return email === 'exist@naver.com';
  }),

  findBy: jest.fn().mockImplementation(async ({ email }) => {
    if (email === 'exist@naver.com') {
      return {
        id: '1',
        name: 'Existing User',
        email: 'exist@naver.com',
        encryptedPassword: hashValue('password'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    return null;
  }),
} as unknown as UserRepository;

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should sign up a user', async () => {
    const user = await service.signUp({
      name: 'Test User',
      email: 'test@naver.com',
      password: 'password',
    });

    expect(user).toBeDefined();
    expect(user.name).toBe('Test User');
    expect(user.email).toBe('test@naver.com');
    expect(user.encryptedPassword).toBeDefined();
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('createdAt');
    expect(user).toHaveProperty('updatedAt');
  });

  it('should throw UserAlreadyExistsError if user already exists', async () => {
    await expect(
      service.signUp({
        name: 'Existing User',
        email: 'exist@naver.com',
        password: 'password',
      }),
    ).rejects.toThrow(UserAlreadyExistsError);
  });

  it('should verify password successfully', async () => {
    const verifiedUser = await service.verifyPassword({
      email: 'exist@naver.com',
      password: 'password',
    });
    expect(verifiedUser).toBeDefined();
    expect(verifiedUser.email).toBe('exist@naver.com');
    expect(verifiedUser.name).toBe('Existing User');
  });

  it('should throw UserNotFoundError if user does not exist', async () => {
    await expect(
      service.verifyPassword({
        email: 'notExist@naver.com',
        password: 'password',
      }),
    ).rejects.toThrow(UserNotFoundError);
  });

  it('should throw InvalidPasswordError if password is incorrect', async () => {
    await expect(
      service.verifyPassword({
        email: 'exist@naver.com',
        password: 'wrong-password',
      }),
    ).rejects.toThrow(InvalidPasswordError);
  });
});
