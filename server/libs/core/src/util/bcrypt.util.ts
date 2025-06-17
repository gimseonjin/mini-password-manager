import * as bcrypt from 'bcrypt';

const rounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;

export const hashValue = (plain: string) => bcrypt.hashSync(plain, rounds);
export const verifyHash = (plain: string, hashed: string) =>
  bcrypt.compareSync(plain, hashed);
