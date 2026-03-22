import { Role } from '@prisma/client';

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  lastLoginAt: Date | null;
  lastLoginIp: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IJwtPayload {
  sub: string;
  email: string;
  role: Role;
  type: 'access';
  jti: string;
  iat: number;
  exp: number;
}
