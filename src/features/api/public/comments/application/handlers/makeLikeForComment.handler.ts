import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikesSqlRepository } from '../../../../../entities/postgres/likesSql.repository';

export class MakeLikeForCommentCommand {
  constructor(
    public id: string,
    public userId: string,
    public status: string,
  ) {}
}

@CommandHandler(MakeLikeForCommentCommand)
export class MakeLikeForCommentHandler
  implements ICommandHandler<MakeLikeForCommentCommand>
{
  constructor(private likeRepo: LikesSqlRepository) {}

  async execute(command: MakeLikeForCommentCommand): Promise<any> {
    const existedLike = await this.likeRepo.getLikeByParentIdAndUserId(
      command.id,
      'comment',
      command.userId,
    );

    const currentLike = {
      status: command.status,
      addedAt: new Date(),
    };
    if (existedLike) {
      await this.likeRepo.update(
        command.id,
        'comment',
        command.userId,
        currentLike,
      );
    } else {
      await this.likeRepo.create(
        command.id,
        'comment',
        command.userId,
        currentLike,
      );
    }
    return Promise.resolve(undefined);
  }
}
