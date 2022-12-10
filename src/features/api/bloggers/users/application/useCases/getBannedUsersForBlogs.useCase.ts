import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BloggerUserQueryDto } from '../../dto/bloggerUserQuery.dto';
import { BlogBannedUsersSqlRepository } from '../../../../../entities/postgres/blogBannedUsersSql.repository';

export class GetBannedUsersForBlogsCommand {
  constructor(public blogId: string, public query: BloggerUserQueryDto) {}
}

@CommandHandler(GetBannedUsersForBlogsCommand)
export class GetBannedUsersForBlogsUseCase
  implements ICommandHandler<GetBannedUsersForBlogsCommand>
{
  constructor(private bannedUsers: BlogBannedUsersSqlRepository) {}
  execute(command: GetBannedUsersForBlogsCommand) {
    return this.bannedUsers.getBannedUsersForBlog(
      command.blogId,
      command.query,
    );
  }
}
