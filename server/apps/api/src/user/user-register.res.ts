import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserResponseDto {
  @ApiProperty({ example: '1', description: '사용자 ID' })
  id: string;

  @ApiProperty({ example: '홍길동', description: '사용자 이름' })
  name: string;

  @ApiProperty({
    example: {
      value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      expiresIn: 3600,
    },
    description: '액세스 토큰 정보',
  })
  accessToken: {
    value: string;
    expiresIn: number;
  };
}
