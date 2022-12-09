import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostSqlRepository } from '../../../../../entities/postgres/postSql.repository';

export class DeletePostCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(private postRepo: PostSqlRepository) {}

  async execute(command: DeletePostCommand): Promise<any> {
    return this.postRepo.deletePost(command.id);
  }
}
