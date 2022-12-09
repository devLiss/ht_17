import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostInputModelDto } from '../../api/bloggers/blogs/dto/postInputModel.dto';

export class PostSqlRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  //TODO: разобраться с типами!!!
  async createPost(post: any) {
    const query = `insert into posts ("title","content","shortDescription", "createdAt","blogId") values($1, $2, $3, $4, $5) returning id`;
    const createdPost = await this.dataSource.query(query, [
      post.title,
      post.content,
      post.shortDescription,
      post.createdAt,
      post.blogId,
    ]);

    const getQuery = `select p.*, b.name as "blogName" from posts p left join blogs b on p."blogId" = b.id where p.id = '${createdPost[0].id}'`;
    const returnedPost = await this.dataSource.query(getQuery);

    return returnedPost.length ? returnedPost[0] : null;
  }
  async deletePost(id: string) {
    return this.dataSource.query(`delete from posts where id = '${id}'`);
  }
  async updatePost(id: string, cpDto: PostInputModelDto) {
    const query = `update posts set title = '${cpDto.title}', "shortDescription" = '${cpDto.shortDescription}', content = '${cpDto.content}' where id = '${id}'`;
    return this.dataSource.query(query);
  }
  async deleteAll() {
    return this.dataSource.query(`delete from posts`);
  }

  async getPostById(id: string) {
    const query = `select p.*, b.name as "blogName" from posts p left join blogs b on p."blogId" = b.id where p.id = '${id}'`;
    const post = await this.dataSource.query(query);
    return post.length ? post[0] : null;
  }
}
