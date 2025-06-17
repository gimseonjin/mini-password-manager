import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { AuthTokens, JwtExpiresIn, Token, UserInfo } from './auth.interface';

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
    );
    const refreshToken = this.generateToken(
      payload,
      (process.env.JWT_REFRESH_EXPIRES_IN as JwtExpiresIn) || '7d',
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  private generateToken(payload: object, expiresIn: JwtExpiresIn): Token {
    const secretKey = process.env.JWT_SECRET || 'defaultSecretKey';
    const options: jwt.SignOptions = {
      expiresIn,
      audience: 'me',
      issuer: 'me',
    };
    const token = jwt.sign(payload, secretKey, options);
    return {
      value: token,
      expiresIn,
    };
  }
}
