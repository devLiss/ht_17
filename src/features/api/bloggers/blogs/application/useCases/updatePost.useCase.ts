import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostInputModelDto } from '../../dto/postInputModel.dto';
import { PostSqlRepository } from '../../../../../entities/postgres/postSql.repository';

export class UpdatePostCommand {
  constructor(public id: string, public cpDto: PostInputModelDto) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(private postRepo: PostSqlRepository) {}
  execute(command: UpdatePostCommand): Promise<any> {
    return this.postRepo.updatePost(command.id, command.cpDto);
  }
}
