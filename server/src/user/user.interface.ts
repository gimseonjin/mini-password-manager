interface User {
  id: string;
  name: string;
  email: string;
  encryptedPassword: string;
  createdAt: Date;
  updatedAt: Date;
}

interface RegisterUser {
  name: string;
  email: string;
  encryptedPassword: string;
}
