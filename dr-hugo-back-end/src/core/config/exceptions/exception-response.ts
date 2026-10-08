import { HttpException, HttpStatus } from "@nestjs/common";
import { QueryFailedError } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';
import { HttpArgumentsHost } from "@nestjs/common/interfaces";
import { getDescriptionFromStatusCode } from "src/core/utils/http.utils";
import { ErrorDefinition } from "src/core/vo/consts/errors";

const UNIQUE_VIOLATION_CODE = '23505';
const DEFAULT_UNIQUE_VIOLATION_MESSAGE =
  'Já existe um registro com os dados informados';
const UNIQUE_CONSTRAINT_MESSAGES: Record<string, string> = {
  UQ_dv_user_email_hash_role: 'Já existe usuário com este e-mail cadastrado',
  UQ_dv_user_tax_id_hash_role:
    'Já existe usuário com este CPF/CNPJ cadastrado',
  UQ_dv_user_phone_hash_role: 'Já existe usuário com este telefone cadastrado',
  UQ_dv_doctor_registration_crm: 'Já existe médico com este CRM cadastrado',
};

export class ExceptionResponse {
  @ApiProperty({
    description: 'Caminho da URL onde ocorreu o erro',
    example: '/domain/terms/invalid_type',
    type: String
  })
  public path: string;

  @ApiProperty({
    description: 'Método HTTP utilizado na requisição',
    example: 'GET',
    enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    type: String
  })
  public method: string;

  @ApiProperty({
    description: 'Nome descritivo do status HTTP',
    example: 'Not Found',
    type: String
  })
  public name: string;

  @ApiProperty({
    description: 'Código de status HTTP da resposta',
    example: 404,
    type: Number,
    minimum: 100,
    maximum: 599
  })
  public status: number;

  @ApiProperty({
    description: 'Código de erro padronizado do sistema',
    example: 'E033',
    type: String,
    required: false
  })
  public errorCode?: string;

  @ApiProperty({
    description: 'Nome identificador do erro',
    example: 'USER_NOT_FOUND',
    type: String,
    required: false
  })
  public errorName?: string;

  @ApiProperty({
    description: 'Mensagem detalhada sobre o erro ocorrido',
    example: 'Termo não encontrado para o tipo especificado',
    type: String
  })
  public message: string;

  @ApiProperty({
    description: 'Data e hora em que o erro ocorreu (ISO 8601)',
    example: '2026-01-23T10:30:00.000Z',
    type: String,
    format: 'date-time'
  })
  public timestamp: string;

  private constructor() {
    this.timestamp = new Date().toISOString();
  }

  public static from(
    exception: unknown,
    ctx: HttpArgumentsHost,
  ): ExceptionResponse {
    const response = this.buildBaseResponse(ctx);

    if (exception instanceof HttpException) {
      return this.fromHttpException(exception, response);
    }

    if (exception instanceof QueryFailedError) {
      return this.fromQueryFailedError(exception, response);
    }

    return this.fromUnknownException(exception, response);
  }

  private static buildBaseResponse(
    ctx: HttpArgumentsHost,
  ): ExceptionResponse {
    const instance = new ExceptionResponse();
    const request = ctx.getRequest();

    instance.path = request.url;
    instance.method = request.method;

    return instance;
  }

  private static fromHttpException(
    exception: HttpException,
    response: ExceptionResponse,
  ): ExceptionResponse {
    response.status = exception.getStatus();
    response.name = getDescriptionFromStatusCode(response.status);

    const exceptionResponse = exception.getResponse();
    if (this.isErrorDefinition(exceptionResponse)) {
      response.errorCode = exceptionResponse.code;
      response.errorName = exceptionResponse.name;
      response.message = exceptionResponse.message;
    } else {
      response.message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any)?.message ?? exception.message;
    }

    return response;
  }

  private static fromQueryFailedError(
    exception: QueryFailedError,
    response: ExceptionResponse,
  ): ExceptionResponse {
    const driverError = exception.driverError as {
      code?: string;
      constraint?: string;
    };

    if (driverError?.code === UNIQUE_VIOLATION_CODE) {
      response.status = HttpStatus.CONFLICT;
      response.name = getDescriptionFromStatusCode(response.status);
      response.message =
        UNIQUE_CONSTRAINT_MESSAGES[driverError.constraint] ??
        DEFAULT_UNIQUE_VIOLATION_MESSAGE;
      return response;
    }

    response.status = HttpStatus.INTERNAL_SERVER_ERROR;
    response.name = getDescriptionFromStatusCode(response.status);
    response.message = 'Erro ao processar requisição';
    return response;
  }

  private static fromUnknownException(
    exception: unknown,
    response: ExceptionResponse,
  ): ExceptionResponse {
    response.status = HttpStatus.INTERNAL_SERVER_ERROR;
    response.name = getDescriptionFromStatusCode(response.status);
    if (exception instanceof Error) {
      response.message = exception.message;
      return response;
    }

    response.message = 'Erro ao processar requisição';
    return response;
  }

  private static isErrorDefinition(response: any): response is ErrorDefinition {
    return (
      response &&
      typeof response === 'object' &&
      typeof response.code === 'string' &&
      typeof response.name === 'string' &&
      typeof response.message === 'string' &&
      typeof response.httpStatus === 'number'
    );
  }
}