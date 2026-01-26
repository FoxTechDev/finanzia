import { SetMetadata } from '@nestjs/common';
import { RoleCodes } from '../enums/roles.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleCodes[]) => SetMetadata(ROLES_KEY, roles);
