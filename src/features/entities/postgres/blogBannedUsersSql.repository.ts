import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { query } from 'express';
import { BloggerUserQueryDto } from '../../api/bloggers/users/dto/bloggerUserQuery.dto';

export class BlogBannedUsersSqlRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  //TODO: разрабраться с типами
  async banUserForBlog(bannedUser: any) {
    const query = `insert into "blogUserBan" ("banDate", "isBanned", "banReason","userId", "blogId") values ($1, $2, $3, $4,$5)`;
    return this.dataSource.query(query, [
      bannedUser.banDate,
      true,
      bannedUser.banReason,
      bannedUser.id,
      bannedUser.blogId,
    ]);
  }

  async unbanUserForBlog(blogId: string, userId: string) {
    return this.dataSource.query(
      `delete from "blogUserBan" where "userId" = '${userId}' and "blogId" = '${blogId}'`,
    );
  }

  async getBannedUsersForBlog(blogId: string, buqDto: BloggerUserQueryDto) {
    const offset = (buqDto.pageNumber - 1) * buqDto.pageSize;
    const orderBy =
      buqDto.sortBy != 'createdAt'
        ? `"${buqDto.sortBy}" COLLATE "C"`
        : `b."${buqDto.sortBy}"`;
    const query = `select b.*, u.* from "blogUserBan" b left join users u on b."userId" = u.id where "blogId" = '${blogId}' order by ${orderBy} ${buqDto.sortDirection} limit $1 offset $2 `;
    console.log(query);
    const users = await this.dataSource.query(query, [buqDto.pageSize, offset]);

    const totalCount = await this.dataSource.query(
      `select count(*) from "blogUserBan" where "blogId" = '${blogId}'`,
    );

    const temp = users.map((item) => {
      const t = {
        id: item.id,
        login: item.login,
        banInfo: {
          isBanned: !!item.isBanned,
          banDate: item.banDate,
          banReason: item.banReason,
        },
      };
      console.log(t);
      return t;
    });
    return {
      pagesCount: Math.ceil(+totalCount[0].count / buqDto.pageSize),
      page: buqDto.pageNumber,
      pageSize: buqDto.pageSize,
      totalCount: +totalCount[0].count,
      items: temp,
    };
  }

  async getByBlogIdAndUserId(blogId: string, userId: string) {
    const banData = await this.dataSource.query(
      `select * from "blogUserBan" where "blogId" = '${blogId}' and "userId" = '${userId}'`,
    );

    return banData.length ? banData[0] : null;
  }
}
