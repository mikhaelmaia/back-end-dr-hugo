import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client } from 'minio';
import { ConfigService } from '@nestjs/config';
import { getAllMinioBuckets } from './minio.buckets';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly client: Client;

  public constructor(private readonly configService: ConfigService) {
    this.client = new Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT'),
      port: Number(this.configService.get<number>('MINIO_PORT')),
      useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY'),
    });
  }

  public async onModuleInit(): Promise<void> {
    const allBuckets = getAllMinioBuckets();

    for (const bucket of allBuckets) {
      await this.ensureBucketExists(bucket);
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
    const exists = await this.client.bucketExists(bucket);
    if (!exists) {
      await this.client.makeBucket(bucket);
    }
  }
}
