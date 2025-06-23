import { Test, TestingModule } from '@nestjs/testing';
import { VaultService } from './vault.service';
import { VaultRepository } from './vault.repository';
import { VaultAlreadyExistsError } from './vault.exception';

const mockVaultRepository = {
  create: jest.fn().mockImplementation(async (vault) => ({
    ...vault,
    id: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [],
  })),
  existsBy: jest.fn().mockImplementation(async ({ userId, name }) => {
    return userId === '1' && name === 'Existing Vault';
  }),
  findBy: jest.fn().mockImplementation(async ({ userId, name }) => {
    if (userId === '1' && name === 'Existing Vault') {
      return {
        id: '1',
        userId: '1',
        name: 'Existing Vault',
        description: 'This is an existing vault',
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [],
      };
    }
    return null;
  }),
} as unknown as VaultRepository;

describe('VaultService', () => {
  let service: VaultService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VaultService,
        {
          provide: VaultRepository,
          useValue: mockVaultRepository,
        },
      ],
    }).compile();

    service = module.get<VaultService>(VaultService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new vault', async () => {
    const vaultData = {
      userId: '1',
      vaultName: 'New Vault',
      description: 'This is a new vault',
    };

    const newVault = await service.createVault(vaultData);
    expect(newVault).toEqual({
      id: '1',
      userId: '1',
      name: 'New Vault',
      description: 'This is a new vault',
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      items: [],
    });
  });

  it('should throw an error if vault already exists', async () => {
    const vaultData = {
      userId: '1',
      vaultName: 'Existing Vault',
      description: 'This vault already exists',
    };

    await expect(service.createVault(vaultData)).rejects.toThrow(
      VaultAlreadyExistsError,
    );
  });
});
