import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => {
  const host = process.env.REDIS_HOST;
  const port = Number(process.env.REDIS_PORT);
  const password = process.env.REDIS_PASSWORD;
  const db = Number(process.env.REDIS_DB ?? 0);
  const ttl = Number(process.env.REDIS_TTL ?? 60);

  if (!host) {
    throw new Error('REDIS_HOST é obrigatório');
  }

  if (!port || Number.isNaN(port) || port <= 0 || port > 65535) {
    throw new Error('REDIS_PORT deve ser um número válido entre 1 e 65535');
  }

  if (Number.isNaN(db) || db < 0) {
    throw new Error('REDIS_DB deve ser um número não negativo');
  }

  if (Number.isNaN(ttl) || ttl <= 0) {
    throw new Error('REDIS_TTL deve ser um número positivo');
  }

  return {
    host,
    port,
    password,
    db,
    ttl,
  };
});
