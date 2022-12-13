import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PaginatingQueryDto } from '../../api/bloggers/blogs/dto/paginatingQuery.dto';
import { PostQueryDto } from '../../api/public/posts/dto/postQuery.dto';

export class CommentsSqlRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async create(comment: any) {
    const query = `insert into comments ("content","createdAt", "userId", "postId") values ($1, $2, $3, $4)`;
    const createdComment = await this.dataSource.query(query, [
      comment.content,
      comment.createdAt,
      comment.userId,
      comment.postId,
    ]);

    return createdComment;
  }

  async deleteById(id: string) {
    return this.dataSource.query(`delete from comments where id = '${id}'`);
  }

  async update(id: string, content: string) {
    const query = `update comments set content = '${content} where id = '${id}'`;
    return this.dataSource.query(query);
  }

  async getCommentById(id: string) {
    const query = `select * from comments where id = '${id}'`;
    const comment = await this.dataSource.query(query);
    console.log(comment);
    return comment.length ? comment[0] : null;
  }

  async getCommentByIdWithLikes(id: string, userId: string) {}

  async getCommentByPostId(
    postId: string,
    userId: string,
    pagination: PostQueryDto,
  ) {
    const offset = (pagination.pageNumber - 1) * pagination.pageSize;
    const orderBy =
      pagination.sortBy != 'createdAt'
        ? `"${pagination.sortBy}" COLLATE "C"`
        : `c."${pagination.sortBy}"`;

    const query = `select c.id, c."content" ,c."userId" , u.login as "userLogin", c."createdAt", (select count(*) from likes l where l."likeableType" ='comment' and l.status = 'Like' and l."likeableId" =c.id ) as "likesCount" ,
    (select count(*) from likes l where l."likeableType" ='comment' and l.status = 'Dislike' and l."likeableId" =c.id ) as "dislikesCount" ,
    coalesce((select  l.status from likes l where l."likeableType" ='comment' and l."likeableId" = c.id and l."userId" = '${userId}'  ),'None') as "myStatus"
    from "comments" c join users u on c."userId" = u.id where c."postId" = '${postId}' order by ${orderBy} limit ${pagination.pageSize} offset ${offset}`;

    const comments = await this.dataSource.query(query);

    const total = await this.dataSource.query(
      `select count(*) from comments c where c."postId" = '${postId}'`,
    );

    const temp = comments.map((item) => {
      const t = {
        id: item.id,
        content: item.content,
        userId: item.userId,
        userLogin: item.userLogin,
        createdAt: item.createdAt,
        likesInfo: {
          likesCount: item.likesCount,
          dislikesCount: item.dislikesCount,
          myStatus: item.myStatus,
        },
      };
    });

    return {
      pagesCount: Math.ceil(+total[0].count / pagination.pageSize),
      page: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount: +total[0].count,
      items: temp,
    };
  }

  async getCommentsForBlogger(id: string, query: PaginatingQueryDto) {}
}
