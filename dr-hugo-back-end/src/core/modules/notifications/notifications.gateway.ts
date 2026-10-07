import { Logger, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtProviderService } from 'src/core/modules/auth/aggregates/jwt-provider.service';
import { UserRole } from 'src/core/vo/consts/enums';
import { DoctorService } from 'src/modules/doctors/doctor.service';
import { InstitutionService } from 'src/modules/institutions/institution.service';
import { PatientsService } from 'src/modules/patients/patients.service';
import { WsAuthGuard } from './guards/ws-auth.guard';
import { NotificationsService } from './notifications.service';

/**
 * Unified notification channel — namespace `/notifications`.
 *
 * All authenticated roles (PATIENT, DOCTOR, INSTITUTION, ADMIN) may connect.
 * On connection each socket automatically joins two rooms:
 *   - `user:<userId>`        — generic user-level targeting (all roles)
 *   - `<role>:<profileId>`   — profile-level targeting resolved per role:
 *       PATIENT     → patient:<patientId>
 *       DOCTOR      → doctor:<doctorId>
 *       INSTITUTION → institution:<institutionId>
 *       ADMIN       → (no profile room)
 *
 * To emit to a specific profile use NotificationsService.emitToPatient(),
 * emitToDoctor() or emitToInstitution(). To emit to any user by userId
 * use emitToUser().
 *
 * WsAuthGuard is applied to @SubscribeMessage handlers to re-validate
 * the JWT and enforce @Roles() on individual message events.
 */
@WebSocketGateway({
  namespace: '/notifications',
  cors: { origin: '*' },
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  private readonly server: Server;

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly jwtProvider: JwtProviderService,
    private readonly patientsService: PatientsService,
    private readonly doctorService: DoctorService,
    private readonly institutionService: InstitutionService,
  ) {}

  public afterInit(server: Server): void {
    this.notificationsService.setServer(server);
    this.logger.log('NotificationsGateway initialized on /notifications');
  }

  public async handleConnection(client: Socket): Promise<void> {
    try {
      const token = this.extractToken(client);
      if (!token) {
        this.disconnect(client, 'Token not provided');
        return;
      }

      const payload = await this.jwtProvider.verify(token);

      const profileRoom = await this.resolveProfileRoom(
        payload.role,
        payload.sub,
      );

      await client.join(this.notificationsService.userRoom(payload.sub));
      if (profileRoom) {
        await client.join(profileRoom);
      }

      client.data.userId = payload.sub;
      client.data.role = payload.role;

      this.logger.debug(
        `Client ${client.id} connected — userId:${payload.sub} role:${payload.role}`,
      );
    } catch {
      this.disconnect(client, 'Authentication failed');
    }
  }

  public handleDisconnect(client: Socket): void {
    this.logger.debug(`Client ${client.id} disconnected`);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('ping')
  public handlePing(@ConnectedSocket() client: Socket) {
    this.logger.debug(`Ping from userId:${client.data.userId}`);
    return { event: 'pong', data: 'pong' };
  }

  private async resolveProfileRoom(
    role: UserRole,
    userId: string,
  ): Promise<string | null> {
    switch (role) {
      case UserRole.PATIENT: {
        const patientId =
          await this.patientsService.findPatientIdByUserId(userId);
        return this.notificationsService.patientRoom(patientId);
      }
      case UserRole.DOCTOR: {
        const doctorId = await this.doctorService.findDoctorIdByUserId(userId);
        return this.notificationsService.doctorRoom(doctorId);
      }
      case UserRole.INSTITUTION: {
        const institutionId =
          await this.institutionService.findInstitutionIdByUserId(userId);
        return this.notificationsService.institutionRoom(institutionId);
      }
      default:
        return null;
    }
  }

  private extractToken(client: Socket): string | null {
    const raw: string = client.handshake?.auth?.token;
    if (!raw) return null;
    return raw.startsWith('Bearer ') ? raw.slice(7) : raw;
  }

  private disconnect(client: Socket, reason: string): void {
    this.logger.warn(`Rejecting connection ${client.id}: ${reason}`);
    client.emit('error', { message: reason });
    client.disconnect();
  }
}
