import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostSqlRepository } from '../../../../../entities/postgres/postSql.repository';
import { NotFoundException } from '@nestjs/common';

export class DeletePostCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(private postRepo: PostSqlRepository) {}

  async execute(command: DeletePostCommand): Promise<any> {
    const post = await this.postRepo.getPostById(command.id);
    if (!post) throw new NotFoundException();
    return this.postRepo.deletePost(command.id);
  }
}
