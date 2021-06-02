import { SetMetadata } from '@nestjs/common';

export const Role = (role: 'admin' | 'member') => SetMetadata('role', role);