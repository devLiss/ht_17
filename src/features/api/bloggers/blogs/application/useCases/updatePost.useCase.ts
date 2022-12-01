import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostDto } from '../../../../public/posts/dto/createPost.dto';
import { PostsRepository } from '../../../../../entities/mongo/post/infrastructure/posts.repository';
import { PostInputModelDto } from '../../dto/postInputModel.dto';

export class UpdatePostCommand {
  constructor(public id: string, public cpDto: PostInputModelDto) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(private postRepo: PostsRepository) {}
  execute(command: UpdatePostCommand): Promise<any> {
    return this.postRepo.updatePost(command.id, command.cpDto);
  }
}
