import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsSqlRepository } from '../../../../../entities/postgres/commentsSql.repository';

export class DeleteCommentCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentHandler
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(private commentRepo: CommentsSqlRepository) {}

  execute(command: DeleteCommentCommand): Promise<any> {
    return this.commentRepo.deleteById(command.id);
  }
}
