import { Controller, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { TokenService } from './token.service';
import { TokenDto } from './dtos/token.dto';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from 'src/core/base/base.controller';
import { Token } from './entities/token.entity';
import { Public } from 'src/core/vo/decorators/public.decorator';
import { TokenType } from 'src/core/vo/consts/enums';

@ApiTags('Token Controller')
@Public()
@Controller('token')
export class TokenController extends BaseController<
  Token,
  TokenDto,
  TokenService
> {
  public constructor(tokenService: TokenService) {
    super(tokenService);
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  public async validateToken(
    @Query('token') token: string,
    @Query('identification') identification: string,
    @Query('type') type: TokenType,
  ): Promise<TokenDto> {
    return await this.service.validateToken(token, identification, type);
  }
}
