import { BlogInputModelDto } from '../../dto/blogInputModel.dto';
import { BlogsRepo } from '../../../../../entities/mongo/blogs/infrastructure/blog.repository';
import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogDocument } from '../../../../../entities/mongo/blogs/entities/blogs.schema';

export class CreateBlogCommand {
  constructor(public inputModel: BlogInputModelDto, public user: any) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(private blogsRepo: BlogsRepo) {}
  async execute(command: CreateBlogCommand) {
    const blog = {
      name: command.inputModel.name,
      description: command.inputModel.description,
      websiteUrl: command.inputModel.websiteUrl,
      createdAt: new Date().toISOString(),
      blogOwnerInfo: { userId: command.user.id, userLogin: command.user.login },
      banInfo: {
        isBanned: false,
        banDate: null,
      },
    };

    const createdBlog = await this.blogsRepo.createBlog(blog);

    return {
      id: createdBlog._id,
      name: createdBlog.name,
      description: createdBlog.description,
      websiteUrl: createdBlog.websiteUrl,
      createdAt: createdBlog.createdAt,
    };
  }
}
