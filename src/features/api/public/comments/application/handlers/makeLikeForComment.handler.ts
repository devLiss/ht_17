import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class MakeLikeForCommentCommand {
  constructor() {}
}

@CommandHandler(MakeLikeForCommentCommand)
export class MakeLikeForCommentHandler
  implements ICommandHandler<MakeLikeForCommentCommand>
{
  constructor() {}

  execute(command: MakeLikeForCommentCommand): Promise<any> {
    return Promise.resolve(undefined);
  }
}
