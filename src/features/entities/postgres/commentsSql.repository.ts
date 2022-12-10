import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

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
}
