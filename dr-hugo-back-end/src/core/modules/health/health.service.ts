import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { MinioService } from '../media/minio/minio.service';
import { RedisService } from '../cache/redis/redis.service';
import { HealthDto, ServiceHealthDto } from './dtos/health.dto';

@Injectable()
export class HealthService {
    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
        private readonly minioService: MinioService,
        private readonly redisService: RedisService
    ) {}

    public async getHealth(): Promise<HealthDto> {
        const services = await Promise.all([
            this.checkDatabase(),
            this.checkMinio(),
            this.checkRedis()
        ]);

        const allHealthy = services.every(service => service.status === 'healthy');

        return {
            status: allHealthy ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '1.0.0',
            services
        };
    }

    private async checkDatabase(): Promise<ServiceHealthDto> {
        const start = Date.now();
        try {
            await this.dataSource.query('SELECT 1');
            return {
                name: 'PostgreSQL',
                status: 'healthy',
                message: 'Conectado com sucesso',
                responseTime: Date.now() - start
            };
        } catch (error) {
            return {
                name: 'PostgreSQL',
                status: 'unhealthy',
                message: error.message,
                responseTime: Date.now() - start
            };
        }
    }

    private async checkMinio(): Promise<ServiceHealthDto> {
        const start = Date.now();
        try {
            await this.minioService.getClient().listBuckets();
            return {
                name: 'MinIO',
                status: 'healthy',
                message: 'Conectado com sucesso',
                responseTime: Date.now() - start
            };
        } catch (error) {
            return {
                name: 'MinIO',
                status: 'unhealthy',
                message: error.message,
                responseTime: Date.now() - start
            };
        }
    }

    private async checkRedis(): Promise<ServiceHealthDto> {
        const start = Date.now();
        try {
            await this.redisService.ping();
            return {
                name: 'Redis',
                status: 'healthy',
                message: 'Conectado com sucesso',
                responseTime: Date.now() - start
            };
        } catch (error) {
            return {
                name: 'Redis',
                status: 'unhealthy',
                message: error.message,
                responseTime: Date.now() - start
            };
        }
    }
}