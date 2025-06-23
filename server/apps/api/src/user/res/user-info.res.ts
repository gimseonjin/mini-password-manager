import { ApiProperty } from '@nestjs/swagger';

export class UserInfoResponseDto {
  @ApiProperty({ example: '1', description: '사용자 ID' })
  id: string;
  @ApiProperty({ example: '홍길동', description: '사용자 이름' })
  name: string;
  @ApiProperty({
    example: 'example@google.co.kr',
    description: '사용자 이메일',
  })
  email: string;
  @ApiProperty({
    example: '2023-10-01T12:00:00.000Z',
    description: '사용자 생성일',
  })
  createdAt: string;
  @ApiProperty({
    example: '2023-10-01T12:00:00.000Z',
    description: '사용자 정보 수정일',
  })
  updatedAt: string;
}
