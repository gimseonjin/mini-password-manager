export class UserAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`이미 존재하는 이메일입니다: ${email}`);
    this.name = 'UserAlreadyExistsError';
  }
}

export class UserNotFoundError extends Error {
  constructor(email: string) {
    super(`User with email ${email} not found`);
    this.name = 'UserNotFoundError';
  }
}

export class InvalidPasswordError extends Error {
  constructor() {
    super('Invalid password');
    this.name = 'InvalidPasswordError';
  }
}
