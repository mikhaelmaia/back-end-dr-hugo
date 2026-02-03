import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { acceptFalseThrows } from '../../utils/functions';
import { Optional } from '../../utils/optional';

export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const IsUUIDParam = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const id = Optional.ofNullable(request.params)
      .map((params) => params[data])
      .orElseThrow(() => new BadRequestException(`ID não enviado`));

    acceptFalseThrows(
      UUID_REGEX.test(id),
      () => new BadRequestException(`ID não está no formato esperado`),
    );

    return id;
  },
);
