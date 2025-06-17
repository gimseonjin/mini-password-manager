export interface User {
  id: string;
  name: string;
  email: string;
  encryptedPassword: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterUser {
  name: string;
  email: string;
  password: string;
}

export interface AuthenticateUser {
  email: string;
  password: string;
}
