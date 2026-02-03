import { Module } from '@nestjs/common';
import { TokenController } from './token.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';
import { TokenService } from './token.service';
import { TokenRepository } from './token.repository';
import { TokenMapper } from './token.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([Token])],
  controllers: [TokenController],
  providers: [TokenService, TokenMapper, TokenRepository],
  exports: [TokenService],
})
export class TokenModule {}
