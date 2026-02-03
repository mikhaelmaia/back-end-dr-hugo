import Redis, { RedisOptions } from 'ioredis';
import { Logger } from '@nestjs/common';

export class RedisClient {
  private static instance: Redis;
  private static readonly logger = new Logger(RedisClient.name);

  public static create(options: RedisOptions): Redis {
    if (!RedisClient.instance) {
      const redisOptions: RedisOptions = {
        ...options,
        enableReadyCheck: true,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      };

      RedisClient.instance = new Redis(redisOptions);

      RedisClient.instance.on('connect', () =>
        RedisClient.logger.log('Conexão com o Redis estabelecida com sucesso'),
      );

      RedisClient.instance.on('ready', () =>
        RedisClient.logger.log('Redis está pronto para receber comandos'),
      );

      RedisClient.instance.on('error', (err) =>
        RedisClient.logger.error(
          'Erro ao estabelecer conexão com o Redis',
          err,
        ),
      );

      RedisClient.instance.on('close', () =>
        RedisClient.logger.warn('Conexão com o Redis foi fechada'),
      );

      RedisClient.instance.on('reconnecting', () =>
        RedisClient.logger.log('Tentando reconectar ao Redis...'),
      );

      RedisClient.instance
        .connect()
        .catch((err) =>
          RedisClient.logger.error(
            'Falha ao conectar ao Redis na inicialização',
            err,
          ),
        );
    }

    return RedisClient.instance;
  }

  public static async disconnect(): Promise<void> {
    if (RedisClient.instance) {
      await RedisClient.instance.quit();
      RedisClient.instance = null;
      RedisClient.logger.log('Instância Redis desconectada e limpa');
    }
  }
}
