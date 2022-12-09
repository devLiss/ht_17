import { Controller, Delete, Get, HttpCode } from '@nestjs/common';
import { PostsService } from '../posts/application/posts.service';
import { CommentsService } from '../comments/application/comments.service';
import { UsersService } from '../../super-admin/users/application/users.service';
import { BlogsRepo } from '../../../entities/mongo/blogs/infrastructure/blog.repository';
import { BannedUsersQueryRepo } from '../../../entities/mongo/blogs/infrastructure/bannedUsers.query-repo';
import { UserSqlRepository } from '../../../entities/postgres/userSql.repository';
import { SessionsSqlRepository } from '../../../entities/postgres/sessionsSql.repository';
import { BlogsSqlRepository } from '../../../entities/postgres/blogsSql.repository';
import { PostSqlRepository } from '../../../entities/postgres/postSql.repository';

@Controller('testing')
export class TestingController {
  constructor(
    private userRepo: UserSqlRepository,
    private sessionRepo: SessionsSqlRepository,
    private blogRepo: BlogsSqlRepository,
    private postRepo: PostSqlRepository,
  ) {}

  @Delete('all-data')
  @HttpCode(204)
  async deleteAllData() {
    await this.sessionRepo.deleteAll();
    await this.userRepo.deleteAll();
    await this.blogRepo.deleteAll();
    await this.postRepo.deleteAll();
  }
}
