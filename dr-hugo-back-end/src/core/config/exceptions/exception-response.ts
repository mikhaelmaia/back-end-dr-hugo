import { HttpException, HttpStatus } from "@nestjs/common";
import { ApiProperty } from '@nestjs/swagger';
import { HttpArgumentsHost } from "@nestjs/common/interfaces";
import { getDescriptionFromStatusCode } from "src/core/utils/http.utils";
import { ErrorDefinition } from "src/core/vo/consts/errors";

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