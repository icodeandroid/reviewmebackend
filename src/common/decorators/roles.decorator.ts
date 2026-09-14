import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enums';

export const ROLES_KEY = 'roles';

/** Restricts a route to the given user roles. */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
