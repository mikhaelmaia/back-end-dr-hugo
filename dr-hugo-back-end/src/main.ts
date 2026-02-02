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

const configureSwagger = (app: INestApplication): void => {
  const options = new DocumentBuilder()
    .setTitle('Doutor Viu API')
    .setDescription('API for Doutor Viu Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);
};

const configureValidation = (): ValidationPipe[] => {
  return [
    new ValidationPipe({
      transform: true,
      exceptionFactory: async (errors: ValidationError[]) => {
        return new BadRequestException({
          message: extractErrorMessages(errors)
        });
      },
    }),
  ];
};

const configureApplicationFilters = (app: INestApplication): ExceptionFilter => {
  return new AllExceptionsFilter(app.get(HttpAdapterHost));
};

const configureApplicationInterceptors = (app: INestApplication): void => {
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
  );
};

const configureApplication = (app: INestApplication): void => {
  app.useGlobalPipes(...configureValidation());
  app.useGlobalFilters(configureApplicationFilters(app));
  app.enableShutdownHooks();
  app.get(HttpAdapterHost);
  configureApplicationInterceptors(app);
  configureSwagger(app);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
};

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule, { cors: corsOptions, bufferLogs: true });
  configureApplication(app);
  await app.listen(process.env.PORT || 3000);
};

bootstrap();
