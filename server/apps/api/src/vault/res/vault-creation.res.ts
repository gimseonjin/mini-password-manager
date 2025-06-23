import { ApiProperty } from '@nestjs/swagger';

export class CreateVaultResponseDto {
  @ApiProperty({
    description: 'Vault 고유 ID',
    example: 'vault_123456789',
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'Vault 이름',
    example: 'My Personal Vault',
    type: String,
  })
  name: string;

  @ApiProperty({
    description: 'Vault 설명',
    example: '개인적인 비밀번호들을 저장하는 Vault',
    type: String,
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Vault 생성일시',
    example: '2024-01-01T00:00:00.000Z',
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Vault 수정일시',
    example: '2024-01-01T00:00:00.000Z',
    type: Date,
  })
  updatedAt: Date;
}
