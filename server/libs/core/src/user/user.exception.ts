export class UserAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`이미 존재하는 이메일입니다: ${email}`);
    this.name = 'UserAlreadyExistsError';
  }
}

export class UserNotFoundError extends Error {
  constructor(email: string) {
    super(`해당 이메일을 가진 사용자를 찾을 수 없습니다: ${email}`);
    this.name = 'UserNotFoundError';
  }
}

export class InvalidPasswordError extends Error {
  constructor() {
    super('비밀번호가 일치하지 않습니다.');
    this.name = 'InvalidPasswordError';
  }
}
