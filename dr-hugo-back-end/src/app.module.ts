import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ManagerModule } from './modules/manager.module';
import { IsUniqueConstraint } from './core/vo/validators/is-unique.validator';
import { ExistsInValidator } from './core/vo/validators/exists-in.validator';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TimeoutInterceptor } from './core/config/interceptors/timeout.interceptor';
import { AuthGuard } from './core/config/security/auth.guard';
import { ConfigModule } from '@nestjs/config';
import configuration from './core/config/environment/configuration';
import { DatabaseModule } from './core/config/database/database.module';
import { CoreModule } from './core/modules/core.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    CoreModule,
    ManagerModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    IsUniqueConstraint,
    ExistsInValidator,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
  ],
})
export class AppModule {}
