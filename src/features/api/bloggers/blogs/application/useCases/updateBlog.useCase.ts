import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepo } from '../../../../../entities/mongo/blogs/infrastructure/blog.repository';
import { BlogInputModelDto } from '../../dto/blogInputModel.dto';

export class UpdateBlogCommand {
  constructor(public id: string, public blog: BlogInputModelDto) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(protected blogsRepo: BlogsRepo) {}
  async execute(command: UpdateBlogCommand) {
    const blog = await this.blogsRepo.updateBlog(
      command.id,
      command.blog.name,
      command.blog.description,
      command.blog.websiteUrl,
    );
    return blog;
  }
}
