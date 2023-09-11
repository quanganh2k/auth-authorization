import { SetMetadata } from '@nestjs/common';
import { Roles as RolesInterface } from 'src/constants';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: RolesInterface[]) =>
  SetMetadata(ROLES_KEY, roles);
