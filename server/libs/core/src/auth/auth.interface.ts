export interface UserInfo {
  id: string;
  email: string;
}

export interface AuthTokens {
  accessToken: Token;
  refreshToken: Token;
}

export interface Token {
  value: string;
  expiresIn: JwtExpiresIn;
}

export type JwtExpiresIn = '1h' | '7d' | '30m' | '24h';
