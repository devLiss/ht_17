import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepo } from '../../../../../entities/mongo/blogs/infrastructure/blog.repository';
import { BlogsSqlRepository } from '../../../../../entities/postgres/blogsSql.repository';

export class DeleteBlogCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(private blogsRepo: BlogsSqlRepository) {}
  async execute(command: DeleteBlogCommand) {
    console.log(command.id);
    return await this.blogsRepo.deleteOne(command.id);
  }
}
