import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { InvalidTokenException } from './auth.exception';

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
    process.env.JWT_ACCESS_SECRET = 'testSecret';
    process.env.JWT_REFRESH_SECRET = 'testRefreshSecret';
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

  it('should refresh tokens correctly', () => {
    process.env.JWT_ACCESS_SECRET = 'testSecret';
    process.env.JWT_REFRESH_SECRET = 'testRefreshSecret';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';
    const oldToken = service.generateAuthTokens({
      email: 'example@naver.com',
      id: '1',
    });

    const newToken = service.refreshToken(oldToken.refreshToken.value);

    expect(newToken).toHaveProperty('accessToken');
    expect(newToken).toHaveProperty('refreshToken');
    expect(newToken.accessToken.value).toBeDefined();
    expect(newToken.refreshToken.value).toBeDefined();
    expect(newToken.accessToken.expiresIn).toBe('1h');
    expect(newToken.refreshToken.expiresIn).toBe('7d');
    expect(newToken.accessToken.value).not.toEqual(oldToken.accessToken.value);
    expect(newToken.refreshToken.value).not.toEqual(
      oldToken.refreshToken.value,
    );
  });

  it('should refresh tokens only with refresh token', () => {
    process.env.JWT_ACCESS_SECRET = 'testSecret';
    process.env.JWT_REFRESH_SECRET = 'testRefreshSecret';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';
    const oldToken = service.generateAuthTokens({
      email: 'example@naver.com',
      id: '1',
    });

    expect(() => {
      service.refreshToken(oldToken.accessToken.value);
    }).toThrow(InvalidTokenException);
  });
});
