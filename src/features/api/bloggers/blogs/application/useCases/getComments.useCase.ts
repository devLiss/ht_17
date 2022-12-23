import { PaginatingQueryDto } from '../../dto/paginatingQuery.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsQueryRepository } from '../../../../../entities/mongo/comment/infrastucture/comments-query.repository';
import { CommentsSqlRepository } from '../../../../../entities/postgres/commentsSql.repository';

export class GetCommentsCommand {
  constructor(public paginatingQuery: PaginatingQueryDto, public user: any) {}
}

@CommandHandler(GetCommentsCommand)
export class GetCommentsUseCase implements ICommandHandler<GetCommentsCommand> {
  constructor(private commentsQueryRepo: CommentsSqlRepository) {}
  execute(command: GetCommentsCommand) {
    return this.commentsQueryRepo.getCommentsForBlogger(
      command.user.id,
      command.paginatingQuery,
    );
  }
}
