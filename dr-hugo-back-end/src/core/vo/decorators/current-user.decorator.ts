import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDto } from 'src/modules/users/dtos/user.dto';

type UserKeys = keyof UserDto;

export const CurrentUser = createParamDecorator(
  (data: UserKeys, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return data ? request.currentUser?.[data] : request.currentUser;
  },
);
