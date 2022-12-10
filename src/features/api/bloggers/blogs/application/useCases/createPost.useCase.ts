import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostByIdDto } from '../../../../public/blogs/dto/createPostById.dto';
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
      createdAt: new Date().toISOString(),
    };

    console.log(post);
    const createdPost = await this.postRepo.createPost(post);
    if (createdPost) {
      createdPost['extendedLikesInfo'] = {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      };
    }
    console.log(createdPost);
    return createdPost;
  }
}
