import { ApiProperty } from '@nestjs/swagger';

export class LoginUserRequestDto {
  @ApiProperty({ example: '홍길동', description: '사용자 이름' })
  email: string;

  @ApiProperty({ example: 'P@ssw0rd123', description: '비밀번호(8자 이상)' })
  password: string;
}
