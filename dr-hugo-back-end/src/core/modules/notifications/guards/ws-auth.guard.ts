import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Socket } from 'socket.io';
import { JwtProviderService } from 'src/core/modules/auth/aggregates/jwt-provider.service';
import { ROLES_KEY } from 'src/core/vo/decorators/roles.decorator';
import { UserRole } from 'src/core/vo/consts/enums';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(
    private readonly jwtProvider: JwtProviderService,
    private readonly reflector: Reflector,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient<Socket>();
    const token = this.extractToken(client);

    if (!token) {
      client.disconnect();
      return false;
    }

    try {
      const payload = await this.jwtProvider.verify(token);

      const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );

      if (requiredRoles?.length && !requiredRoles.includes(payload.role)) {
        client.disconnect();
        return false;
      }

      client.data.userId = payload.sub;
      client.data.role = payload.role;

      return true;
    } catch {
      client.disconnect();
      return false;
    }
  }

  private extractToken(client: Socket): string | null {
    const raw: string = client.handshake?.auth?.token;
    if (!raw) return null;
    return raw.startsWith('Bearer ') ? raw.slice(7) : raw;
  }
}
