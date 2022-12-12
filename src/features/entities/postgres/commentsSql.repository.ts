import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PaginatingQueryDto } from '../../api/bloggers/blogs/dto/paginatingQuery.dto';

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
    return comment.length ? comment[0] : null;
  }

  async getCommentByIdWithLikes(id: string, userId: string) {}

  async getCommentByPostId() {}

  async getCommentsForBlogger(id: string, query: PaginatingQueryDto) {}
}
