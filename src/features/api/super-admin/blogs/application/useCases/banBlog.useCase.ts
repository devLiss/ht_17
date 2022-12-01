import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepo } from '../../../../../entities/mongo/blogs/infrastructure/blog.repository';

export class BanBlogCommand {
  constructor(public id: string, public isBanned: boolean) {}
}

@CommandHandler(BanBlogCommand)
export class BanBlogUseCase implements ICommandHandler<BanBlogCommand> {
  constructor(private blogsRepo: BlogsRepo) {}

  execute(command: BanBlogCommand): Promise<any> {
    return this.blogsRepo.banBlog(command.id, command.isBanned);
  }
}
