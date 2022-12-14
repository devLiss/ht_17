import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikesSqlRepository } from '../../../../../entities/postgres/likesSql.repository';

export class MakeLikeCommand {
  constructor(
    public id: string,
    public type: string,
    public userId: string,
    public status: string,
  ) {}
}

@CommandHandler(MakeLikeCommand)
export class MakeLikeHandler implements ICommandHandler<MakeLikeCommand> {
  constructor(private likeRepo: LikesSqlRepository) {}

  async execute(command: MakeLikeCommand): Promise<any> {
    const existedLike = await this.likeRepo.getLikeByParentIdAndUserId(
      command.id,
      command.type,
      command.userId,
    );

    const currentLike = {
      status: command.status,
      addedAt: new Date().toISOString(),
    };

    if (command.status === 'None' && !existedLike) {
      return;
    }

    if (command.status === 'None' && existedLike) {
      await this.likeRepo.deleteLike(command.id, command.type, command.userId);
      return;
    }
    if (existedLike) {
      await this.likeRepo.update(
        command.id,
        command.type,
        command.userId,
        currentLike,
      );
    } else {
      await this.likeRepo.create(
        command.id,
        command.type,
        command.userId,
        currentLike,
      );
    }
    return Promise.resolve(undefined);
  }
}
