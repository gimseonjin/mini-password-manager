import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserRequestDto {
  @ApiProperty({ example: 'test@email.com', description: '사용자 이메일' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '홍길동', description: '사용자 이름' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'P@ssw0rd123', description: '비밀번호(8자 이상)' })
  @IsString()
  @MinLength(8)
  password: string;
}
