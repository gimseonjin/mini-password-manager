export class InvalidTokenException extends Error {
  constructor(message: string = '유효하지 않은 토큰입니다.') {
    super(message);
    this.name = 'InvalidTokenException';
  }
}
