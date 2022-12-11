import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostInputModelDto } from '../../dto/postInputModel.dto';
import { PostSqlRepository } from '../../../../../entities/postgres/postSql.repository';
import { NotFoundException } from '@nestjs/common';

export class UpdatePostCommand {
  constructor(public id: string, public cpDto: PostInputModelDto) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(private postRepo: PostSqlRepository) {}
  async execute(command: UpdatePostCommand): Promise<any> {
    const post = await this.postRepo.getPostById(command.id);
    if (!post) throw new NotFoundException();
    return this.postRepo.updatePost(command.id, command.cpDto);
  }
}
