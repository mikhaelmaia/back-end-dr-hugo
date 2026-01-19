import {
  BadRequestException,
  ClassSerializerInterceptor,
  ExceptionFilter,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer, ValidationError } from 'class-validator';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './core/config/exceptions/all-exceptions.filter';
import { corsOptions } from './core/config/security/security.providers';

const extractErrorMessages = (errors: ValidationError[]): string[] => {
  const messages: string[] = [];

  errors.forEach((error) => {
    if (error.constraints) {
      messages.push(...Object.values(error.constraints));
    }
    if (error.children && error.children.length > 0) {
      messages.push(...extractErrorMessages(error.children));
    }
  });

  return messages;
};

const configAppDocument = (app: INestApplication): void => {
  const options = new DocumentBuilder()
    .setTitle('Dr Hugo API')
    .setDescription('API for Dr Hugo Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);
};

const configAppPipes = (): ValidationPipe[] => {
  return [
    new ValidationPipe({
      transform: true,
      exceptionFactory: async (errors: ValidationError[]) => {
        const errorMessages = extractErrorMessages(errors);
        return new BadRequestException(errorMessages.toString());
      },
    }),
  ];
};

const configAppFilters = (app: INestApplication): ExceptionFilter[] => {
  return [new AllExceptionsFilter(app.get(HttpAdapterHost))];
};

const configAppInterceptors = (app: INestApplication): void => {
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
};

const configApp = (app: INestApplication): void => {
  app.useGlobalPipes(...configAppPipes());
  app.useGlobalFilters(...configAppFilters(app));
  configAppInterceptors(app);
  configAppDocument(app);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
};

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule, { cors: corsOptions });
  configApp(app);
  await app.listen(process.env.PORT || 3000);
};

bootstrap();
