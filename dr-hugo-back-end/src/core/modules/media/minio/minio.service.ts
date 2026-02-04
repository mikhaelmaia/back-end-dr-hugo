import { Injectable, Logger } from '@nestjs/common';
import { Client } from 'minio';
import { ConfigService } from '@nestjs/config';
import { getAllMinioBuckets } from './minio.buckets';

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private readonly client: Client;

  private initialized = false;
  private initializing?: Promise<void>;

  constructor(private readonly configService: ConfigService) {
    const endPoint = this.configService.get<string>('MINIO_ENDPOINT');
    const port = Number(this.configService.get<number>('MINIO_PORT'));
    const useSSL = this.configService.get<string>('MINIO_USE_SSL') === 'true';

    this.client = new Client({
      endPoint,
      port,
      useSSL,
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY'),
    });

    this.logger.log(
      `MinIO client criado (${useSSL ? 'https' : 'http'}://${endPoint}:${port})`,
    );
  }

  public async getClient(): Promise<Client> {
    await this.ensureInitialized();
    return this.client;
  }

  public getObjectUrl(bucket: string, objectName: string): string {
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT');
    const port = Number(this.configService.get<number>('MINIO_PORT'));
    const useSSL = this.configService.get<string>('MINIO_USE_SSL') === 'true';

    const protocol = useSSL ? 'https' : 'http';
    const portSuffix =
      (useSSL && port === 443) || (!useSSL && port === 80) ? '' : `:${port}`;

    return `${protocol}://${endpoint}${portSuffix}/${bucket}/${objectName}`;
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;

    if (!this.initializing) {
      this.initializing = this.initialize();
    }

    await this.initializing;
  }

  private async initialize(): Promise<void> {
    const maxRetries = 10;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(
          `Conectando ao MinIO (tentativa ${attempt}/${maxRetries})`,
        );

        await this.client.listBuckets();

        const buckets = getAllMinioBuckets();
        for (const bucket of buckets) {
          await this.ensureBucketExists(bucket);
        }

        this.initialized = true;
        this.logger.log('MinIO inicializado com sucesso');
        return;
      } catch (error) {
        this.logger.warn(
          `MinIO indisponível (tentativa ${attempt}/${maxRetries})`,
        );

        if (attempt === maxRetries) {
          this.logger.error('Falha ao inicializar MinIO', error);
          throw error;
        }

        await this.sleep(attempt * 1500);
      }
    }
  }

  private async ensureBucketExists(bucket: string): Promise<void> {
    const exists = await this.client.bucketExists(bucket);

    if (!exists) {
      await this.client.makeBucket(bucket);
      this.logger.log(`Bucket '${bucket}' criado`);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
