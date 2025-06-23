-- CreateTable
CREATE TABLE "vault" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE "vault_item" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "vaultId" UUID NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "encryptedBlob" TEXT NOT NULL,
  "encryption" JSONB NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY ("vaultId") REFERENCES "vault"("id") ON DELETE CASCADE
);

-- CreateIndex
CREATE INDEX "vault_item_vault_idx" ON "vault_item" ("vaultId");