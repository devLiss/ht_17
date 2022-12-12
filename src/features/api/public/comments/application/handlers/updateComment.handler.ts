import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class UpdateCommentCommand {
  constructor() {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentHandler
  implements ICommandHandler<UpdateCommentCommand>
{
  execute(command: UpdateCommentCommand): Promise<any> {
    return Promise.resolve(undefined);
  }
  constructor() {}
}
