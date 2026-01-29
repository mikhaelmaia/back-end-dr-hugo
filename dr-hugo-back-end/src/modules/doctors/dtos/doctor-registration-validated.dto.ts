import { ApiProperty } from '@nestjs/swagger';

export class DoctorRegistrationData {

    @ApiProperty({
        description: 'Nome completo do médico conforme registro no CRM',
        example: 'Dr. João Silva Santos',
        type: String
    })
    public name: string;

    @ApiProperty({
        description: 'Número do CRM do médico',
        example: '123456',
        type: String
    })
    public crm: string;

    @ApiProperty({
        description: 'Estado brasileiro onde o CRM foi emitido',
        example: 'SP',
        type: String
    })
    public uf: string;

    @ApiProperty({
        description: 'Situação atual do registro no CRM',
        example: 'ATIVO',
        type: String
    })
    public situation: string;

    @ApiProperty({
        description: 'Tipo de registro no CRM',
        example: 'PRINCIPAL',
        type: String
    })
    public type: string;

    @ApiProperty({
        description: 'Data da última atualização dos dados no CRM',
        example: '2024-01-15',
        type: String
    })
    public lastUpdate: string;

    @ApiProperty({
        description: 'Lista de especialidades do médico',
        type: [String],
        example: ['CARDIOLOGIA', 'MEDICINA INTERNA']
    })
    public specialties: string[];

}

export class DoctorRegistrationValidatedDto {

    @ApiProperty({
        description: 'Indica se a validação do registro médico foi bem-sucedida',
        example: true,
        type: Boolean
    })
    public valid: boolean;

    @ApiProperty({
        description: 'Dados do registro médico validados',
        type: DoctorRegistrationData
    })
    public data: DoctorRegistrationData;

    @ApiProperty({
        description: 'Mensagem informativa sobre o resultado da validação',
        example: 'Registro médico validado com sucesso',
        type: String
    })
    public message: string;

}