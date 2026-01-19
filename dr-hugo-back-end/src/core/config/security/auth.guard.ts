import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../vo/decorators/public.decorator';
import { JwtPayload } from '../../vo/types/types';
import { asyncAcceptFalse } from '../../utils/functions';
import { UserRole } from '../../vo/consts/enums';
import { ROLES_KEY } from '../../vo/decorators/roles.decorator';
import { Optional } from '../../utils/optional';
import { UserDto } from '../../../modules/users/dtos/user.dto';
import { UserService } from 'src/modules/users/user.service';
import { JwtProviderService } from 'src/core/modules/auth/aggregates/jwt-provider.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly CURRENT_USER_KEY: string = 'currentUser';

  private readonly METHOD_NOT_ALLOWED_FOR_ROLE: string =
    'Método não permitido para o perfil do usuário';

  private readonly TOKEN_NOT_SENDED: string = 'Token não enviado';

  constructor(
    private readonly reflector: Reflector,
    private readonly jwtProvider: JwtProviderService,
    private readonly userService: UserService,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic: boolean = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );
    await asyncAcceptFalse(isPublic, () => this.performAuthValidation(context));
    return true;
  }

  private async performAuthValidation(
    context: ExecutionContext,
  ): Promise<void> {
    const request: Request = context.switchToHttp().getRequest();
    const token: string = this.extractFromHeader(request);
    const payload: JwtPayload = await this.jwtProvider.verify(token);
    const roles: UserRole[] = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    this.validateRoles(payload.role, roles);
    const user: UserDto = await this.userService.findById(payload.sub);
    request[this.CURRENT_USER_KEY] = user;
  }

  private extractFromHeader(request: any): string {
    return Optional.ofNullable(request.headers.authorization)
      .filter((auth) => auth.startsWith('Bearer '))
      .map((auth) => auth.split(' ')[1])
      .orElseThrow(() => new ForbiddenException(this.TOKEN_NOT_SENDED));
  }

  private validateRoles(userRole: UserRole, roles: UserRole[]): void {
    roles &&
      Optional.of(roles)
        .filter((roles) => roles.length > 0)
        .filter((roles) => roles.includes(userRole))
        .orElseThrow(
          () => new ForbiddenException(this.METHOD_NOT_ALLOWED_FOR_ROLE),
        );
  }
}
