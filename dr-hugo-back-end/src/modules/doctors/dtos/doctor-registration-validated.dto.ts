import { ApiProperty } from '@nestjs/swagger';
import { DoctorSpecializationDto } from '../aggregates/specialization/dtos/doctor-specialization.dto';

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
    public state: string;

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
        description: 'CPF do médico conforme informado na validação',
        example: '12345678901',
        type: String
    })
    public taxId: string;

    @ApiProperty({
        description: 'Indica se o médico é generalista ou especialista',
        example: false,
        type: Boolean
    })
    public isGeneralist: boolean;

    @ApiProperty({
        description: 'Lista de especialidades validadas do médico',
        type: [DoctorSpecializationDto],
        example: [{ name: 'CARDIOLOGIA', rqe: '12345' }]
    })
    public specialties: DoctorSpecializationDto[];

    @ApiProperty({
        description: 'Lista de especialidades conforme registro no CFM',
        type: [String],
        example: ['CARDIOLOGIA', 'MEDICINA INTERNA']
    })
    public cfmSpecialties: string[];

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