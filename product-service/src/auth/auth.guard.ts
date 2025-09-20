import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    //decorador publico
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );
    if (isPublic) return true;
    //obtener jwt
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers['authorization'];
    //validar existencia
    if (!token || Array.isArray(token))
      throw new UnauthorizedException('Token de acceso no proporcionado');
    try {
      //obtener datos
      const data = await this.jwtService.verifyAsync(token, {
        secret:
          process.env.JWT_SECRET ||
          '@y*&0a%K%7P0t@uQ^38HN$y4Z^PK#0zE7dem700Bbf&pC6HF$aU^ARkE@u$nn',
      });
      //validar datos
      if (data.id && data.role !== 'ADMINISTRADOR')
        throw new UnauthorizedException('Rol invalido');
    } catch {
      throw new UnauthorizedException(
        'Error en la validación del token de acceso',
      );
    }
    return true;
  }
}
