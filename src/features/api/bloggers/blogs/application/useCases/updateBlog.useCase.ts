import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogInputModelDto } from '../../dto/blogInputModel.dto';
import { BlogsSqlRepository } from '../../../../../entities/postgres/blogsSql.repository';

export class UpdateBlogCommand {
  constructor(public id: string, public blog: BlogInputModelDto) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(protected blogsRepo: BlogsSqlRepository) {}
  async execute(command: UpdateBlogCommand) {
    const blog = await this.blogsRepo.update(
      command.id,
      command.blog.name,
      command.blog.description,
      command.blog.websiteUrl,
    );
    return blog;
  }
}
