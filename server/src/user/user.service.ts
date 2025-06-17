import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserAlreadyExistsError } from './user.exception';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * 사용자를 회원가입 처리한다.
   *
   * @param param0 - 회원가입 정보 객체
   *   - name: 사용자 이름
   *   - email: 사용자 이메일
   *   - encryptedPassword: **반드시 암호화된 값이어야 함! 평문 비밀번호를 직접 넘기지 마세요.**
   */
  async signUp({
    name,
    email,
    encryptedPassword,
  }: RegisterUser): Promise<User> {
    const isExistUser = await this.userRepository.existsBy({ email });
    if (isExistUser) {
      throw new UserAlreadyExistsError(email);
    }

    return this.userRepository.save({
      name,
      email,
      encryptedPassword,
    });
  }
}
