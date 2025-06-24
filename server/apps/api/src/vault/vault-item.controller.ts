import { VaultEncryption } from '@app/core/vault/vault.interface';
import { VaultService } from '@app/core/vault/vault.service';
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiProperty,
} from '@nestjs/swagger';
import { JwtGuard } from '../guard/jwt.guard';
import { Authentication } from '../guard/authentication.decorator';
import { UserInfo } from '@app/core/auth/auth.interface';
import { VaultNotFoundError } from '@app/core/vault/vault.exception';

export class AddVaultItemRequestDto {
  @ApiProperty({
    description: '아이템 타입 (예: login, note, card)',
    example: 'login',
  })
  type: string;

  @ApiProperty({
    description: '아이템 제목',
    example: 'GitHub 계정',
  })
  title: string;

  @ApiProperty({
    description: '암호화된 데이터 블롭',
    example: 'encrypted_blob_data_here',
  })
  encryptedBlob: string;

  @ApiProperty({
    description: '암호화 정보 (AES-GCM 알고리즘 사용)',
    example: {
      algorithm: 'AES-GCM',
      iv: 'base64_encoded_initialization_vector_here',
      salt: 'base64_encoded_salt_here',
      kdf: 'Argon2id',
      iterations: 100000,
    },
  })
  encryption: VaultEncryption;
}

export class VaultItemDto {
  @ApiProperty({
    description: '아이템 ID',
    example: 'item123',
  })
  id: string;

  @ApiProperty({
    description: '아이템 타입',
    example: 'login',
  })
  type: string;

  @ApiProperty({
    description: '아이템 제목',
    example: 'GitHub 계정',
  })
  title: string;

  @ApiProperty({
    description: '암호화된 데이터 블롭',
    example: 'encrypted_blob_data_here',
  })
  encryptedBlob: string;

  @ApiProperty({
    description: '암호화 정보 (AES-GCM 알고리즘 사용)',
    example: {
      algorithm: 'AES-GCM',
      iv: 'base64_encoded_initialization_vector_here',
      salt: 'base64_encoded_salt_here',
      kdf: 'Argon2id',
      iterations: 100000,
    },
    nullable: true,
  })
  encryption: VaultEncryption | null;

  @ApiProperty({
    description: '생성 시간',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정 시간',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class AddVaultItemResponseDto {
  @ApiProperty({
    description: 'Vault ID',
    example: 'vault123',
  })
  id: string;

  @ApiProperty({
    description: 'Vault 생성 시간',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Vault 수정 시간',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Vault 내 모든 아이템 목록',
    type: [VaultItemDto],
  })
  items: VaultItemDto[];
}

@ApiTags('Vault Items')
@Controller('/api/v1/vaults/:vaultId/items')
@ApiBearerAuth()
export class VaultItemController {
  constructor(private readonly vaultItemService: VaultService) {}

  @UseGuards(JwtGuard)
  @Post()
  @ApiOperation({
    summary: 'Vault 아이템 추가',
    description: '특정 Vault에 새로운 아이템을 추가합니다.',
  })
  @ApiBody({ type: AddVaultItemRequestDto })
  @ApiResponse({
    status: 201,
    description: '아이템이 성공적으로 추가되었습니다.',
    type: AddVaultItemResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증이 필요합니다.',
  })
  @ApiResponse({
    status: 404,
    description: 'Vault를 찾을 수 없습니다.',
  })
  async addVaultItem(
    @Authentication() user: UserInfo,
    @Param('vaultId') vaultId: string,
    @Body() addVaultItemRequest: AddVaultItemRequestDto,
  ): Promise<AddVaultItemResponseDto> {
    try {
      const createdVault = await this.vaultItemService.addVaultItem({
        userId: user.id,
        vaultId,
        item: addVaultItemRequest,
      });

      return {
        id: createdVault.id,
        createdAt: createdVault.createdAt,
        updatedAt: createdVault.updatedAt,
        items: createdVault.items.map((item) => ({
          id: item.id,
          type: item.type,
          title: item.title,
          encryptedBlob: item.encryptedBlob,
          encryption: item.encryption,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })),
      };
    } catch (error) {
      if (error instanceof VaultNotFoundError) {
        throw new NotFoundException('Vault를 찾을 수 없습니다.');
      }
      throw error;
    }
  }

  @UseGuards(JwtGuard)
  @Get()
  @ApiOperation({
    summary: 'Vault 아이템 목록 조회',
    description: '특정 Vault에 포함된 모든 아이템의 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: 'Vault 아이템 목록이 성공적으로 조회되었습니다.',
    type: [VaultItemDto],
  })
  @ApiResponse({
    status: 401,
    description: '인증이 필요합니다.',
  })
  @ApiResponse({
    status: 404,
    description: 'Vault를 찾을 수 없습니다.',
  })
  async getVaultItem(
    @Authentication() user: UserInfo,
    @Param('vaultId') vaultId: string,
  ): Promise<VaultItemDto[]> {
    return this.vaultItemService.getVaultItem({ userId: user.id, vaultId });
  }
}
