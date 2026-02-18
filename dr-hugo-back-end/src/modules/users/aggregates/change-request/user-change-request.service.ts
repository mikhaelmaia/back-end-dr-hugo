import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { RequestUserChangeDto } from './dtos/request-user-change.dto';
import { compare } from 'bcrypt';
import { UserChangeRequestRepository } from './user-change-request.repository';
import { UserRepository } from '../../user.repository';
import { acceptFalseThrows } from 'src/core/utils/functions';
import { toHttpException } from 'src/core/utils/errors.utils';
import { User } from '../../entities/user.entity';
import { EmailHelper } from 'src/core/modules/email/email.helper';
import { TokenService } from 'src/core/modules/token/token.service';
import { UserChangeRequest } from './entities/user-change-request.entity';
import { TokenType, UserChangeRequestStatus } from 'src/core/vo/consts/enums';
import { ConfirmUserChangeRequestDto } from './dtos/confirm-user-change-request.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class UserChangeRequestService {
  private readonly CHANGE_REQUEST_EXPIRATION_HOURS = 1;
  private readonly logger = new Logger(UserChangeRequestService.name);

  constructor(
    private readonly repository: UserChangeRequestRepository,
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    private readonly emailHelper: EmailHelper,
  ) {}

  public async requestChange(
    dto: RequestUserChangeDto,
    userId: string,
  ): Promise<void> {
    if (!dto.newEmail && !dto.newPhone) {
      throw new BadRequestException('Nenhum campo para alteração informado');
    }

    if (dto.newPhone && (!dto.newCountryCode || !dto.newCountryIdd)) {
      throw new BadRequestException(
        'Para alterar o telefone, é obrigatório informar o código do país e o código DDI',
      );
    }

    const user = await this.userRepository.findById(userId);

    const passwordMatches = await compare(dto.currentPassword, user.password);

    acceptFalseThrows(passwordMatches, () => toHttpException('E029'));

    if (dto.newEmail && dto.newEmail !== user.email) {
      await this.handleEmailChange(userId, dto, user);
    }

    if (dto.newPhone && dto.newPhone !== user.phone) {
      await this.handlePhoneChange(userId, dto);
    }
  }

  public async confirmChange(
    dto: ConfirmUserChangeRequestDto,
    userId: string,
  ): Promise<void> {
    const request = await this.repository.findByIdAndUserId(dto.id, userId);

    if (!request) {
      throw new NotFoundException(
        'Solicitação não encontrada ou não pertence ao usuário',
      );
    }

    if (request.status === UserChangeRequestStatus.CONFIRMED) {
      throw new BadRequestException('Solicitação já foi confirmada');
    }

    if (
      request.status === UserChangeRequestStatus.EXPIRED ||
      request.expiresAt < new Date()
    ) {
      throw new BadRequestException('Solicitação expirada');
    }

    await this.tokenService.concludeToken(
      dto.hash,
      userId,
      TokenType.USER_REQUEST_CHANGE,
    );

    if (request.type === 'EMAIL') {
      await this.confirmEmailChange(request, userId);
    }

    if (request.type === 'PHONE') {
      await this.confirmPhoneChange(request, userId);
    }

    request.status = UserChangeRequestStatus.CONFIRMED;
    await this.repository.save(request);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  public async updateExpiredRequests(): Promise<void> {
    this.logger.log(
      'Iniciando atualização de status de solicitações expiradas...',
    );
    await this.repository.updateStatusToExpired();
    this.logger.log('Atualização de status concluída.');
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  public async deleteExpiredRequests(): Promise<void> {
    this.logger.log('Iniciando remoção de solicitações expiradas...');
    await this.repository.deleteExpiredRequests();
    this.logger.log('Remoção de solicitações expiradas concluída.');
  }

  private async handleEmailChange(
    userId: string,
    dto: RequestUserChangeDto,
    user: User,
  ): Promise<void> {
    const request = await this.createRequestChange(
      dto.newEmail,
      'EMAIL',
      userId,
    );

    const token = await this.tokenService.generateToken(
      `${userId}:${request.id}`,
      TokenType.USER_REQUEST_CHANGE,
    );

    await this.emailHelper.sendEmailChangeConfirmation(
      userId,
      dto.newEmail,
      token.token,
      user.role,
      request.id,
    );
  }

  private async handlePhoneChange(
    userId: string,
    dto: RequestUserChangeDto,
  ): Promise<void> {
    const request = await this.createRequestChange(
      dto.newPhone,
      'PHONE',
      userId,
      dto.newCountryCode,
      dto.newCountryIdd,
    );

    await this.tokenService.generateToken(
      `${userId}:${request.id}`,
      TokenType.USER_REQUEST_CHANGE,
    );
    // TODO: Implementar envio de WhatsApp para confirmação de alteração de telefone
    // Incluir request.id nos parâmetros da notificação
  }

  private async createRequestChange(
    newValue: string,
    type: 'EMAIL' | 'PHONE',
    userId: string,
    newCountryCode?: string,
    newCountryIdd?: string,
  ): Promise<UserChangeRequest> {
    const result = await this.repository.insert({
      user: { id: userId } as User,
      type,
      newValue,
      newCountryCode,
      newCountryIdd,
      expiresAt: this.generateExpiresAt(),
      status: UserChangeRequestStatus.PENDING,
    });
    return result.identifiers[0] as UserChangeRequest;
  }

  private generateExpiresAt(): Date {
    const expiresAt = new Date();
    expiresAt.setHours(
      expiresAt.getHours() + this.CHANGE_REQUEST_EXPIRATION_HOURS,
    );
    return expiresAt;
  }

  private async confirmEmailChange(
    request: UserChangeRequest,
    userId: string,
  ): Promise<void> {
    const oldEmail = await this.userRepository.findEmailById(userId);

    await this.userRepository.updateEmail(userId, request.newValue);

    await this.emailHelper.sendEmailChangedWarningToOldEmail(
      request.user.name,
      oldEmail,
      request.newValue,
    );

    await this.emailHelper.sendEmailChangedConfirmationToNewEmail(
      request.user.name,
      oldEmail,
      request.newValue,
    );
  }

  private async confirmPhoneChange(
    request: UserChangeRequest,
    userId: string,
  ): Promise<void> {
    await this.userRepository.updatePhone(userId, request.newValue);

    if (request.newCountryCode) {
      await this.userRepository.updateCountryCode(
        userId,
        request.newCountryCode,
      );
    }

    if (request.newCountryIdd) {
      await this.userRepository.updateCountryIdd(userId, request.newCountryIdd);
    }

    // TODO: Implementar envio de notificação por WhatsApp confirmando alteração
    this.logger.log(
      `Telefone alterado para ${request.newValue} - userId: ${userId}`,
    );
  }
}
