import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PatientDocumentService } from './patient-document.service';
import { CreatePatientDocumentDto } from './dtos/create-patient-document.dto';
import { PatientDocumentDto } from './dtos/patient-document.dto';
import { CurrentUser } from 'src/core/vo/decorators/current-user.decorator';
import { ExceptionResponse } from 'src/core/config/exceptions/exception-response';
import { PatientDocumentPaths } from 'src/core/vo/consts/paths';
import { PatientDocumentType } from 'src/core/vo/consts/enums';

@ApiTags('Documentos Médicos do Paciente')
@ApiBearerAuth()
@Controller(PatientDocumentPaths.BASE)
export class PatientDocumentController {
  constructor(private readonly service: PatientDocumentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar novo documento médico',
    description:
      'Permite criar um novo documento médico para o paciente. O documento deve estar previamente carregado como mídia no sistema.',
  })
  @ApiBody({
    description: 'Dados do documento médico a ser criado',
    type: CreatePatientDocumentDto,
    examples: {
      laboratoryExam: {
        summary: 'Exame Laboratorial',
        description: 'Exemplo de criação de exame laboratorial',
        value: {
          type: PatientDocumentType.LABORATORY_EXAM,
          description: 'Hemograma completo - exame de rotina',
          examDate: '2024-01-15',
          mediaId: '550e8400-e29b-41d4-a716-446655440000',
          requesterName: 'Dr. João Silva',
          examLocation: 'Hospital São Lucas - Laboratório',
          observations: 'Paciente em jejum de 12 horas',
        },
      },
      imagingExam: {
        summary: 'Exame de Imagem',
        description: 'Exemplo de criação de exame de imagem',
        value: {
          type: PatientDocumentType.IMAGING_EXAM,
          description: 'Radiografia de tórax - controle pós-operatório',
          examDate: '2024-01-20',
          mediaId: '550e8400-e29b-41d4-a716-446655440001',
          requesterName: 'Dra. Maria Santos',
          examLocation: 'Centro de Diagnóstico por Imagem',
        },
      },
      prescription: {
        summary: 'Receituário Médico',
        description: 'Exemplo de criação de receituário médico',
        value: {
          type: PatientDocumentType.PRESCRIPTION,
          description: 'Prescrição para tratamento de hipertensão',
          examDate: '2024-01-10',
          mediaId: '550e8400-e29b-41d4-a716-446655440002',
          requesterName: 'Dr. Carlos Oliveira',
          observations: 'Uso contínuo conforme orientação médica',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Documento médico criado com sucesso',
    type: PatientDocumentDto,
    content: {
      'application/json': {
        example: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          type: PatientDocumentType.LABORATORY_EXAM,
          description: 'Hemograma completo - exame de rotina',
          examDate: '2024-01-15T00:00:00.000Z',
          requesterName: 'Dr. João Silva',
          examLocation: 'Hospital São Lucas - Laboratório',
          observations: 'Paciente em jejum de 12 horas',
          mediaUrl: 'https://example.com/documents/document.pdf',
          createdAt: '2024-01-16T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro de validação - dados inválidos ou mídia não encontrada',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido, ausente ou expirado',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem permissão para criar documentos médicos',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Mídia especificada não foi encontrada',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    type: ExceptionResponse,
  })
  public create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePatientDocumentDto,
  ): Promise<PatientDocumentDto> {
    return this.service.create(userId, dto);
  }
}
