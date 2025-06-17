import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { UserAlreadyExistsError } from './user.exception';

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
      encryptedPassword: 'encrypted-password',
    });

    expect(user).toBeDefined();
    expect(user.name).toBe('Test User');
    expect(user.email).toBe('test@naver.com');
    expect(user.encryptedPassword).toBe('encrypted-password');
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('createdAt');
    expect(user).toHaveProperty('updatedAt');
  });

  it('should throw UserAlreadyExistsError if user already exists', async () => {
    await expect(
      service.signUp({
        name: 'Existing User',
        email: 'exist@naver.com',
        encryptedPassword: 'encrypted-password',
      }),
    ).rejects.toThrow(UserAlreadyExistsError);
  });
});
