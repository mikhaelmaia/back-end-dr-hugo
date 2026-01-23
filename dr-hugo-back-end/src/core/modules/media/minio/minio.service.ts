import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client } from 'minio';
import { ConfigService } from '@nestjs/config';
import { getAllMinioBuckets } from './minio.buckets';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly client: Client;
  private readonly logger = new Logger(MinioService.name);

  public constructor(private readonly configService: ConfigService) {
    this.client = new Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT'),
      port: Number(this.configService.get<number>('MINIO_PORT')),
      useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY'),
    });
    
    this.logger.log('Cliente Minio configurado com sucesso');
  }

  public async onModuleInit(): Promise<void> {
    try {
      this.logger.log('Inicializando conexão com Minio...');
      
      await this.client.listBuckets();
      this.logger.log('Conexão com Minio estabelecida com sucesso');
      
      const allBuckets = getAllMinioBuckets();
      this.logger.log(`Verificando ${allBuckets.length} bucket(s): ${allBuckets.join(', ')}`);

      for (const bucket of allBuckets) {
        await this.ensureBucketExists(bucket);
      }
      
      this.logger.log('Todos os buckets foram verificados/criados com sucesso');
    } catch (error) {
      this.logger.error('Erro ao conectar com Minio ou criar buckets', error);
      throw error;
    }
  }

  public getClient(): Client {
    return this.client;
  }

  public async getBucket(bucket: string): Promise<string> {
    await this.ensureBucketExists(bucket);
    return bucket;
  }

  private async ensureBucketExists(bucket: string): Promise<void> {
    try {
      const exists = await this.client.bucketExists(bucket);
      if (!exists) {
        await this.client.makeBucket(bucket);
        this.logger.log(`Bucket '${bucket}' criado com sucesso`);
      } else {
        this.logger.debug(`Bucket '${bucket}' já existe`);
      }
    } catch (error) {
      this.logger.error(`Erro ao verificar/criar bucket '${bucket}'`, error);
      throw error;
    }
  }
}
