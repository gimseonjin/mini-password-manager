import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { AuthTokens, JwtExpiresIn, Token, UserInfo } from './auth.interface';
import { InvalidTokenException } from './auth.exception';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  /**
   * 사용자 정보를 기반으로 JWT 액세스 토큰과 리프레시 토큰을 생성합니다.
   *
   * @param param0 - 사용자 정보
   *   - id: 사용자 ID
   *   - email: 사용자 이메일
   * @returns AuthTokens 객체
   *   - accessToken: 액세스 토큰
   *     - value: JWT 토큰 문자열
   *     - expiresIn: 액세스 토큰의 유효 기간
   *   - refreshToken: 리프레시 토큰
   *    - value: JWT 토큰 문자열
   *    - expiresIn: 리프레시 토큰의 유효 기간
   */
  generateAuthTokens({ id, email }: UserInfo): AuthTokens {
    const payload = { id, email };

    const accessToken = this.generateToken(
      payload,
      (process.env.JWT_ACCESS_EXPIRES_IN as JwtExpiresIn) || '1h',
      process.env.JWT_ACCESS_SECRET || '',
    );
    const refreshToken = this.generateToken(
      payload,
      (process.env.JWT_REFRESH_EXPIRES_IN as JwtExpiresIn) || '7d',
      process.env.JWT_REFRESH_SECRET || '',
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * JWT 토큰을 검증하고 사용자 정보를 반환합니다.
   *
   * @param token - JWT 토큰 문자열
   * @returns UserInfo 객체
   *   - id: 사용자 ID
   *   - email: 사용자 이메일
   * @throws InvalidTokenException - 유효하지 않은 토큰인 경우
   */
  verifyAccessToken(token: string): UserInfo {
    try {
      const secretKey = process.env.JWT_ACCESS_SECRET || '';

      return jwt.verify(token, secretKey) as UserInfo;
    } catch (error) {
      throw new InvalidTokenException('유효하지 않은 토큰입니다.');
    }
  }

  /**
   * 리프레시 토큰을 사용하여 새로운 액세스 토큰과 리프레시 토큰을 생성합니다.
   *
   * @param token - 리프레시 토큰 문자열
   * @returns AuthTokens 객체
   *   - accessToken: 새로 생성된 액세스 토큰
   *   - refreshToken: 새로 생성된 리프레시 토큰
   * @throws InvalidTokenException - 유효하지 않은 토큰인 경우
   */
  refreshToken(token: string): AuthTokens {
    try {
      const refreshSecretKey = process.env.JWT_REFRESH_SECRET || '';

      const userInfo = jwt.verify(token, refreshSecretKey) as UserInfo;
      return this.generateAuthTokens(userInfo);
    } catch (error) {
      throw new InvalidTokenException('유효하지 않은 토큰입니다.');
    }
  }

  private generateToken(
    payload: object,
    expiresIn: JwtExpiresIn,
    secretKey: string,
  ): Token {
    const options: jwt.SignOptions = {
      expiresIn,
      audience: 'me',
      issuer: 'me',
      jwtid: randomUUID(),
    };
    const token = jwt.sign(payload, secretKey, options);
    return {
      value: token,
      expiresIn,
    };
  }
}
