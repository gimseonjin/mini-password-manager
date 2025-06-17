import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a token when logging in', () => {
    process.env.JWT_SECRET = 'testSecret';
    process.env.JWT_ACCESS_EXPIRES_IN = '1h';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';

    const token = service.generateAuthTokens({
      email: 'example@naver.com',
      id: '1',
    });

    expect(token).toHaveProperty('accessToken');
    expect(token).toHaveProperty('refreshToken');
    expect(token.accessToken).toBeDefined();
    expect(token.refreshToken).toBeDefined();
    expect(token.accessToken.value).toBeDefined();
    expect(token.refreshToken.value).toBeDefined();
    expect(token.accessToken.expiresIn).toBe('1h');
    expect(token.refreshToken.expiresIn).toBe('7d');
  });
});
