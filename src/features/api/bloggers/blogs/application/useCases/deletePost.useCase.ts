import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepo } from '../../../../../entities/mongo/blogs/infrastructure/blog.repository';
import { PostsRepository } from '../../../../../entities/mongo/post/infrastructure/posts.repository';

export class DeletePostCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(private postRepo: PostsRepository) {}

  async execute(command: DeletePostCommand): Promise<any> {
    return this.postRepo.deletePost(command.id);
  }
}
