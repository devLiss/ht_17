import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BloggerBanUserDto } from '../../../blogs/dto/bloggerBanUser.dto';
import { BlogQueryRepository } from '../../../../../entities/mongo/blogs/infrastructure/blog-query.repository';
import { UserQueryRepository } from '../../../../../entities/mongo/user/infrastructure/user-query.repository';
import { BannedUser } from '../../../../../entities/mongo/blogs/entities/bannedUsers.schema';
import { BannedUsersQueryRepo } from '../../../../../entities/mongo/blogs/infrastructure/bannedUsers.query-repo';
import { BadRequestException } from '@nestjs/common';

export class BanUserCommand {
  constructor(public id: string, public banInfo: BloggerBanUserDto) {}
}

@CommandHandler(BanUserCommand)
export class BanUser implements ICommandHandler<BanUserCommand> {
  constructor(
    private blogQueryRepo: BlogQueryRepository,
    private userQueryRepo: UserQueryRepository,
    private bannedUsersRepo: BannedUsersQueryRepo,
  ) {}
  async execute(command: BanUserCommand): Promise<any> {
    const blog = await this.blogQueryRepo.findBlogById(command.banInfo.blogId);
    const user = await this.userQueryRepo.findById(command.id);

    const bannedUsers = await this.bannedUsersRepo.getByBlogIdAndUserId(
      blog.id,
      user.id,
    );
    console.log(bannedUsers);
    if (!bannedUsers && command.banInfo.isBanned) {
      const bannedUser = {
        blogId: blog.id,
        id: user.id,
        login: user.login,
        banInfo: {
          isBanned: command.banInfo.isBanned,
          banDate: new Date(),
          banReason: command.banInfo.banReason,
        },
      };
      const createdUser = await this.bannedUsersRepo.createBannedUser(
        bannedUser,
      );
      return true;
    }
    if (bannedUsers && !command.banInfo.isBanned) {
      await this.bannedUsersRepo.deleteUser(blog.id, user.id);
      return true;
    }
  }
}
