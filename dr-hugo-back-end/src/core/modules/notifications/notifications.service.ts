import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  private server: Server;

  public setServer(server: Server): void {
    this.server = server;
  }

  public emitToUser(userId: string, event: string, data: unknown): void {
    if (!this.server) {
      this.logger.warn('WebSocket server not initialized, skipping emission');
      return;
    }
    this.server.to(this.userRoom(userId)).emit(event, data);
  }

  public emitToPatient(patientId: string, event: string, data: unknown): void {
    if (!this.server) {
      this.logger.warn('WebSocket server not initialized, skipping emission');
      return;
    }
    this.server.to(this.patientRoom(patientId)).emit(event, data);
  }

  public emitToDoctor(doctorId: string, event: string, data: unknown): void {
    if (!this.server) {
      this.logger.warn('WebSocket server not initialized, skipping emission');
      return;
    }
    this.server.to(this.doctorRoom(doctorId)).emit(event, data);
  }

  public emitToInstitution(
    institutionId: string,
    event: string,
    data: unknown,
  ): void {
    if (!this.server) {
      this.logger.warn('WebSocket server not initialized, skipping emission');
      return;
    }
    this.server.to(this.institutionRoom(institutionId)).emit(event, data);
  }

  public userRoom(userId: string): string {
    return `user:${userId}`;
  }

  public patientRoom(patientId: string): string {
    return `patient:${patientId}`;
  }

  public doctorRoom(doctorId: string): string {
    return `doctor:${doctorId}`;
  }

  public institutionRoom(institutionId: string): string {
    return `institution:${institutionId}`;
  }
}
