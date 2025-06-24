import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
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
} from '@nestjs/swagger';
import { JwtGuard } from '../guard/jwt.guard';
import { Authentication } from '../guard/authentication.decorator';
import { UserInfo } from '@app/core/auth/auth.interface';
import { VaultService } from '@app/core/vault/vault.service';
import { CreateVaultResponseDto } from './res/vault-creation.res';
import { CreateVaultRequestDto } from './req/vault-creation.req';
import { VaultAlreadyExistsError } from '@app/core/vault/vault.exception';
import { FetchVaultsResponseDto } from './res/vault-fetch.res';

@ApiTags('Vault')
@Controller('/api/v1/vaults')
@ApiBearerAuth()
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  @Post()
  @UseGuards(JwtGuard)
  @ApiOperation({
    summary: 'Vault 생성',
    description: '새로운 Vault를 생성합니다.',
  })
  @ApiBody({ type: CreateVaultRequestDto })
  @ApiResponse({
    status: 201,
    description: 'Vault가 성공적으로 생성되었습니다.',
    type: CreateVaultResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: '이미 존재하는 Vault 이름입니다.',
  })
  @ApiResponse({
    status: 401,
    description: '인증이 필요합니다.',
  })
  async createVault(
    @Authentication() user: UserInfo,
    @Body() { vaultName, description }: CreateVaultRequestDto,
  ): Promise<CreateVaultResponseDto> {
    const { id } = user;
    try {
      const vault = await this.vaultService.createVault({
        userId: id,
        vaultName,
        description,
      });

      return {
        id: vault.id,
        name: vault.name,
        description: vault.description,
        createdAt: vault.createdAt,
        updatedAt: vault.updatedAt,
      };
    } catch (error) {
      if (error instanceof VaultAlreadyExistsError) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  @Delete(':vaultId')
  @UseGuards(JwtGuard)
  @ApiOperation({
    summary: 'Vault 삭제',
    description: '특정 Vault를 삭제합니다.',
  })
  @ApiResponse({
    status: 200,
    description: 'Vault가 성공적으로 삭제되었습니다.',
  })
  @ApiResponse({
    status: 401,
    description: '인증이 필요합니다.',
  })
  @ApiResponse({
    status: 404,
    description: 'Vault를 찾을 수 없습니다.',
  })
  async deleteVault(
    @Authentication() user: UserInfo,
    @Param('vaultId') vaultId: string,
  ): Promise<void> {
    const { id: userId } = user;
    await this.vaultService.deleteValut({ vaultId, userId });
  }

  @Delete()
  @UseGuards(JwtGuard)
  @ApiOperation({
    summary: '모든 Vault 삭제',
    description: '사용자의 모든 Vault를 삭제합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '모든 Vault가 성공적으로 삭제되었습니다.',
  })
  @ApiResponse({
    status: 401,
    description: '인증이 필요합니다.',
  })
  async deleteAllVaults(@Authentication() user: UserInfo): Promise<void> {
    const { id } = user;
    await this.vaultService.deleteAllVaults({ userId: id });
  }

  @UseGuards(JwtGuard)
  @Get()
  @ApiOperation({
    summary: '사용자의 Vault 목록 조회',
    description: '사용자의 모든 Vault 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '사용자의 Vault 목록이 성공적으로 조회되었습니다.',
    type: [FetchVaultsResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: '인증이 필요합니다.',
  })
  async getVaults(
    @Authentication() user: UserInfo,
  ): Promise<FetchVaultsResponseDto[]> {
    const { id } = user;
    const vaults = await this.vaultService.getVaults({ userId: id });

    return vaults.map((vault) => ({
      id: vault.id,
      name: vault.name,
      description: vault.description,
      createdAt: vault.createdAt,
      updatedAt: vault.updatedAt,
    }));
  }
}
