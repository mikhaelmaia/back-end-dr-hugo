import { ApiProperty } from '@nestjs/swagger';

export class ServiceHealthDto {
    @ApiProperty({
        description: 'Nome do serviço',
        example: 'PostgreSQL'
    })
    public name: string;

    @ApiProperty({
        description: 'Status do serviço',
        example: 'healthy',
        enum: ['healthy', 'unhealthy']
    })
    public status: 'healthy' | 'unhealthy';

    @ApiProperty({
        description: 'Mensagem adicional sobre o status',
        example: 'Conectado com sucesso'
    })
    public message: string;

    @ApiProperty({
        description: 'Tempo de resposta em milissegundos',
        example: 15
    })
    public responseTime: number;
}

export class HealthDto {
    @ApiProperty({
        description: 'Status geral da aplicação',
        example: 'healthy',
        enum: ['healthy', 'unhealthy']
    })
    public status: 'healthy' | 'unhealthy';

    @ApiProperty({
        description: 'Timestamp da verificação',
        example: '2024-01-29T10:30:00.000Z'
    })
    public timestamp: string;

    @ApiProperty({
        description: 'Versão da aplicação',
        example: '1.0.0'
    })
    public version: string;

    @ApiProperty({
        description: 'Status dos serviços dependentes',
        type: [ServiceHealthDto]
    })
    public services: ServiceHealthDto[];
}