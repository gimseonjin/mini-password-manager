import { Test, TestingModule } from '@nestjs/testing';
import { VaultService } from './vault.service';
import { VaultRepository } from './vault.repository';
import { VaultAlreadyExistsError, VaultNotFoundError } from './vault.exception';

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
  findBy: jest.fn().mockImplementation(async ({ id, userId, name }) => {
    if ((userId === '1' && name === 'Existing Vault') || id === '1') {
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
  delete: jest.fn().mockImplementation(async ({ id }) => {
    return;
  }),
  findAllBy: jest.fn().mockImplementation(async ({ userId }) => {
    if (userId === '1') {
      return [
        {
          id: '1',
          userId: '1',
          name: 'Vault 1',
          description: 'This is vault 1',
          createdAt: new Date(),
          updatedAt: new Date(),
          items: [],
        },
      ];
    }
    return [];
  }),
  deleteAllBy: jest.fn().mockImplementation(async ({ userId }) => {
    return;
  }),
  addItem: jest.fn().mockImplementation(async (vaultId, item) => {
    if (vaultId === '1') {
      return {
        id: vaultId,
        userId: 'user-1',
        name: 'My Vault',
        description: 'Test Vault',
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [
          {
            ...item,
            id: 'item1',
            vaultId: vaultId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };
    }

    return null; // 혹은 throw new Error, 필요에 따라.
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

  beforeEach(() => {
    jest.clearAllMocks();
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

  it('should delete an existing vault', async () => {
    const vaultData = {
      vaultId: '1',
      userId: '1',
    };

    const result = await service.deleteValut(vaultData);
    expect(result).toBeUndefined();
    expect(mockVaultRepository.delete).toHaveBeenCalledWith({ id: '1' });
  });

  it('should return null if vault does not exist', async () => {
    const vaultData = {
      vaultId: '2',
      userId: '1',
    };

    const result = await service.deleteValut(vaultData);
    expect(result).toBeUndefined();
  });

  it('should delete all vaults for a user', async () => {
    const vaultData = {
      userId: '1',
    };

    await service.deleteAllVaults(vaultData);
    expect(mockVaultRepository.findAllBy).toHaveBeenCalledWith({ userId: '1' });
    expect(mockVaultRepository.deleteAllBy).toHaveBeenCalledWith({
      userId: '1',
    });
  });

  it('should not delete any vaults if none exist for the user', async () => {
    const vaultData = {
      userId: '2',
    };

    await service.deleteAllVaults(vaultData);
    expect(mockVaultRepository.findAllBy).toHaveBeenCalledWith({ userId: '2' });
    expect(mockVaultRepository.deleteAllBy).not.toHaveBeenCalled();
  });

  it(`should add a new item to a vault`, async () => {
    const vaultId = '1';
    const item = {
      type: 'note',
      title: 'Sample Item',
      encryptedBlob: 'encrypted data',
      encryption: null,
    };

    const result = await service.addVaultItem({ vaultId, item });

    expect(result).toEqual(
      expect.objectContaining({
        id: vaultId,
        name: expect.any(String),
        userId: expect.any(String),
        description: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        items: expect.any(Array),
      }),
    );

    const addedItem = result.items[0];
    expect(addedItem).toEqual(
      expect.objectContaining({
        type: item.type,
        title: item.title,
        encryptedBlob: item.encryptedBlob,
        encryption: null,
        id: expect.any(String),
        vaultId: vaultId,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      }),
    );
  });

  it('should throw an error if vault does not exist when adding an item', async () => {
    const vaultId = '2';
    const item = {
      type: 'note',
      title: 'Sample Item',
      encryptedBlob: 'encrypted data',
      encryption: null,
    };

    await expect(service.addVaultItem({ vaultId, item })).rejects.toThrow(
      VaultNotFoundError,
    );
  });
});
