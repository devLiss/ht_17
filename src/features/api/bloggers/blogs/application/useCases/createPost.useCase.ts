import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostByIdDto } from '../../../../public/blogs/dto/createPostById.dto';
import { PostsRepository } from '../../../../../entities/mongo/post/infrastructure/posts.repository';
import { LikesRepository } from '../../../../../entities/mongo/comment/infrastucture/likes.repository';
import * as mongoose from 'mongoose';
import { PostSqlRepository } from '../../../../../entities/postgres/postSql.repository';

export class CreatePostCommand {
  constructor(public cpDto: CreatePostByIdDto, public blog: any) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(protected postRepo: PostSqlRepository) {}

  async execute(command: CreatePostCommand) {
    const post: any = {
      title: command.cpDto.title,
      shortDescription: command.cpDto.shortDescription,
      content: command.cpDto.content,
      blogId: command.blog.id,
      //blogName: command.blog.name,
      createdAt: new Date().toISOString(),
      /*extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },*/
    };

    console.log(post);
    const createdPost = await this.postRepo.createPost(post);
    console.log(createdPost);
    return createdPost;
  }
}
