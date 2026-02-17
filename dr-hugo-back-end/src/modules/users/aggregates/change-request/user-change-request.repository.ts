import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/core/base/base.repository';
import { UserChangeRequest } from './entities/user-change-request.entity';
import { UserChangeRequestStatus } from 'src/core/vo/consts/enums';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserChangeRequestRepository extends BaseRepository<UserChangeRequest> {
  protected override alias: string = 'request';

  constructor(
    @InjectRepository(UserChangeRequest)
    repository: Repository<UserChangeRequest>,
  ) {
    super(repository);
  }

  public async findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<UserChangeRequest | null> {
    return this.createBaseQuery()
      .innerJoin('request.user', 'user')
      .addSelect(['user.id', 'user.name'])
      .where('request.id = :id', { id })
      .andWhere('user.id = :userId', { userId })
      .andWhere('request.deletedAt IS NULL')
      .getOne();
  }

  public async updateStatusToExpired(): Promise<void> {
    await this.createBaseQuery()
      .update(UserChangeRequest)
      .set({ status: UserChangeRequestStatus.EXPIRED })
      .where('expiresAt < :now', { now: new Date() })
      .andWhere('status = :pendingStatus', {
        pendingStatus: UserChangeRequestStatus.PENDING,
      })
      .execute();
  }

  public async deleteExpiredRequests(): Promise<void> {
    const expiredRequests = await this.createBaseQuery()
      .where('request.status = :expiredStatus', {
        expiredStatus: UserChangeRequestStatus.EXPIRED,
      })
      .getMany();

    if (expiredRequests.length > 0) {
      await this.repository.remove(expiredRequests);
    }
  }
}
