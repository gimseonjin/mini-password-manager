import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import {
  InvalidPasswordError,
  UserAlreadyExistsError,
  UserNotFoundError,
} from './user.exception';
import { RegisterUser, User, AuthenticateUser } from './user.interface';
import { hashValue, verifyHash } from '../util/bcrypt.util';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * 사용자를 회원가입 처리한다.
   *
   * @param param0 - 회원가입 정보 객체
   *   - name: 사용자 이름
   *   - email: 사용자 이메일
   *   - password: 사용자 비밀번호
   *
   * @returns 새로 생성된 사용자 정보 객체
   * @throws UserAlreadyExistsError - 이미 존재하는 이메일로 회원가입을 시도
   */
  async signUp({ name, email, password }: RegisterUser): Promise<User> {
    const isExistUser = await this.userRepository.existsBy({ email });
    if (isExistUser) {
      throw new UserAlreadyExistsError(email);
    }

    return this.userRepository.create({
      name,
      email,
      encryptedPassword: hashValue(password),
    });
  }

  /**
   * 사용자의 비밀번호를 검증하고 인증된 사용자 정보를 반환한다.
   *
   * @param param0 - 비밀번호 검증 정보 객체
   *   - email: 사용자 이메일
   *   - password: 사용자 비밀번호
   * @returns 일치하는 경우 사용자 정보 객체를 반환
   * @throws UserNotFoundError - 해당 이메일을 가진 사용자가 존재하지 않는 경우
   * @throws InvalidPasswordError - 비밀번호가 일치하지 않는 경우
   *
   */
  async authenticateUser({ email, password }: AuthenticateUser): Promise<User> {
    const user = await this.userRepository.findBy({ email });
    if (!user) {
      throw new UserNotFoundError(email);
    }

    const isPasswordValid = verifyHash(password, user.encryptedPassword);
    if (!isPasswordValid) {
      throw new InvalidPasswordError();
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findBy({ email });
  }
}
