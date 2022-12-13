import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsSqlRepository } from '../../../../../entities/postgres/commentsSql.repository';

export class UpdateCommentCommand {
  constructor(public id: string, public content: string) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentHandler
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(private commentRepo: CommentsSqlRepository) {}
  execute(command: UpdateCommentCommand): Promise<any> {
    return this.commentRepo.update(command.id, command.content);
  }
}
