import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BloggerBanUserDto } from '../../../blogs/dto/bloggerBanUser.dto';
import { BlogQueryRepository } from '../../../../../entities/mongo/blogs/infrastructure/blog-query.repository';
import { UserQueryRepository } from '../../../../../entities/mongo/user/infrastructure/user-query.repository';
import { BannedUser } from '../../../../../entities/mongo/blogs/entities/bannedUsers.schema';
import { BannedUsersQueryRepo } from '../../../../../entities/mongo/blogs/infrastructure/bannedUsers.query-repo';
import { BadRequestException } from '@nestjs/common';
import { BlogBannedUsersSqlRepository } from '../../../../../entities/postgres/blogBannedUsersSql.repository';
import { BlogsSqlRepository } from '../../../../../entities/postgres/blogsSql.repository';
import { UserSqlRepository } from '../../../../../entities/postgres/userSql.repository';

export class BanUserCommand {
  constructor(public id: string, public banInfo: BloggerBanUserDto) {}
}

@CommandHandler(BanUserCommand)
export class BanUser implements ICommandHandler<BanUserCommand> {
  constructor(
    private blogQueryRepo: BlogsSqlRepository,
    private userQueryRepo: UserSqlRepository,
    //private bannedUsersRepo: BannedUsersQueryRepo,
    private bannedUserRepo: BlogBannedUsersSqlRepository,
  ) {}
  async execute(command: BanUserCommand): Promise<any> {
    const blog = await this.blogQueryRepo.getById(command.banInfo.blogId);
    const user = await this.userQueryRepo.getUserById(command.id);

    const bannedUsers = await this.bannedUserRepo.getByBlogIdAndUserId(
      blog.id,
      user.id,
    );
    console.log(bannedUsers, '<----- bannedUser');
    console.log(user);
    if (!bannedUsers && command.banInfo.isBanned) {
      const bannedUser = {
        blogId: blog.id,
        id: user.id,
        login: user.login,
        isBanned: command.banInfo.isBanned,
        banDate: new Date(),
        banReason: command.banInfo.banReason,
      };
      const createdUser = await this.bannedUserRepo.banUserForBlog(bannedUser);
      return true;
    }
    if (bannedUsers && !command.banInfo.isBanned) {
      await this.bannedUserRepo.unbanUserForBlog(blog.id, user.id);
      return true;
    }
  }
}
