import { Controller, Delete, Get, HttpCode } from '@nestjs/common';
import { PostsService } from '../posts/application/posts.service';
import { CommentsService } from '../comments/application/comments.service';
import { UsersService } from '../../super-admin/users/application/users.service';
import { BlogsRepo } from '../../../entities/mongo/blogs/infrastructure/blog.repository';
import { BannedUsersQueryRepo } from '../../../entities/mongo/blogs/infrastructure/bannedUsers.query-repo';
import { UserSqlRepository } from '../../../entities/postgres/userSql.repository';
import { SessionsSqlRepository } from '../../../entities/postgres/sessionsSql.repository';

@Controller('testing')
export class TestingController {
  constructor(
    private postService: PostsService,
    private commentsService: CommentsService,
    private usersService: UsersService,
    private blogRepo: BlogsRepo,
    private userRepo: UserSqlRepository,
    private bannedUsersQueryRepo: BannedUsersQueryRepo,
    private sessionRepo: SessionsSqlRepository,
  ) {}

  @Delete('all-data')
  @HttpCode(204)
  async deleteAllData() {
    await this.postService.deleteAllPosts();
    await this.blogRepo.deleteAll();
    await this.commentsService.deleteAllComments();
    await this.usersService.deleteAll();
    await this.bannedUsersQueryRepo.deleteAll();

    await this.sessionRepo.deleteAll();
    await this.userRepo.deleteAll();
  }
}
