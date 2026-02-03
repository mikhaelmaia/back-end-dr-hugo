import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthResponse } from '../dto/auth-response.dto';
import { UserDto } from 'src/modules/users/dtos/user.dto';
import { JwtPayload } from 'src/core/vo/types/types';

@Injectable()
export class JwtProviderService {
  private readonly INVALID_OR_EXPIRED_TOKEN: string =
    'Token inválido ou expirado';

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async signTokens(user: UserDto): Promise<AuthResponse> {
    return {
      accessToken: await this.sign(user),
      refreshToken: await this.signRefresh(user),
    };
  }

  public async verify(token: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch (error) {
      throw new UnauthorizedException(this.INVALID_OR_EXPIRED_TOKEN);
    }
  }

  private sign(user: UserDto): Promise<string> {
    return this.jwtService.signAsync(this.buildPayload(user));
  }

  private signRefresh(user: UserDto): Promise<string> {
    return this.jwtService.signAsync(this.buildPayload(user), {
      expiresIn: this.configService.get<number>('jwt.refreshExpiresIn'),
    });
  }

  private buildPayload(user: UserDto): JwtPayload {
    return {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
