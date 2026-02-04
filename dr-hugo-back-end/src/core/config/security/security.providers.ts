import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const corsOptions: CorsOptions = {
  origin: ['https://doutorviu.com.br', 'https://www.doutorviu.com.br'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  maxAge: 3600,
};
