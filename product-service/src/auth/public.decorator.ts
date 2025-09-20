import { SetMetadata } from '@nestjs/common';
//Decorador @Public, este permite el acceso a rutas sin validar el JWT.
export const Public = () => SetMetadata('isPublic', true);
