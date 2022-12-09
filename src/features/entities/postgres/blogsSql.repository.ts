import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogQueryDto } from '../../api/public/blogs/dto/blogQuery.dto';

export class BlogsSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  //TODO: разобраться с типами!
  async create(blog: any) {
    const insertBlogQuery = `insert into blogs ("name", "description", "websiteUrl", "isBanned","banDate","createdAt","ownerId") values ($1, $2, $3, $4, $5, $6, $7 ) returning "id","name", "description", "websiteUrl","createdAt" `;
    const createdBlog = await this.dataSource.query(insertBlogQuery, [
      blog.name,
      blog.description,
      blog.websiteUrl,
      blog.banInfo.isBanned,
      blog.banInfo.banDate,
      blog.createdAt,
      blog.blogOwnerInfo.userId,
    ]);

    return createdBlog.length ? createdBlog[0] : null;
  }
  async update() {}
  async deleteOne(id: string) {
    const query = `delete from blogs where id = $1`;
    return this.dataSource.query(query, [id]);
  }
  async deleteAll() {
    const query = `delete from blogs`;
    return this.dataSource.query(query);
  }

  async getAll() {
    const query = `select * from blogs`;
    return this.dataSource.query(query);
  }
  async getAllPublic(queryDto: BlogQueryDto) {
    const query = `select * from blogs `;

    return this.dataSource.query(query, []);
  }
  async getAllByUser() {}
  async getById(id: string) {
    const query = `select * from blogs where id=$1`;
    const blog = await this.dataSource.query(query, [id]);
    return blog.length ? blog[0] : null;
  }
}
