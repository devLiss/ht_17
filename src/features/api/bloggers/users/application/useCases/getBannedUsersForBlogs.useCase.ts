import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BloggerUserQueryDto } from '../../dto/bloggerUserQuery.dto';
import { BannedUsersQueryRepo } from '../../../../../entities/mongo/blogs/infrastructure/bannedUsers.query-repo';

export class GetBannedUsersForBlogsCommand {
  constructor(public blogId: string, public query: BloggerUserQueryDto) {}
}

@CommandHandler(GetBannedUsersForBlogsCommand)
export class GetBannedUsersForBlogsUseCase
  implements ICommandHandler<GetBannedUsersForBlogsCommand>
{
  constructor(private bannedUsers: BannedUsersQueryRepo) {}
  execute(command: GetBannedUsersForBlogsCommand) {
    return this.bannedUsers.getAllByBlogId(command.blogId, command.query);
  }
}
