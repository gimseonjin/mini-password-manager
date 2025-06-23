import { ApiProperty } from '@nestjs/swagger';

export class CreateVaultRequestDto {
  @ApiProperty({
    description: 'Vault 이름',
    example: 'My Personal Vault',
    type: String,
  })
  vaultName: string;

  @ApiProperty({
    description: 'Vault 설명 (선택사항)',
    example: '개인적인 비밀번호들을 저장하는 Vault',
    type: String,
    required: false,
  })
  description?: string;
}
