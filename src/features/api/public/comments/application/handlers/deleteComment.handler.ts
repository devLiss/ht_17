import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeleteCommentCommand {
  constructor() {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentHandler
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor() {}

  execute(command: DeleteCommentCommand): Promise<any> {
    return Promise.resolve(undefined);
  }
}
