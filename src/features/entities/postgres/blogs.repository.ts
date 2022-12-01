import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogQueryDto } from '../../api/public/blogs/dto/blogQuery.dto';

export class BlogsRepositoryPostgres {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async create() {}
  async update() {}
  async deleteOne() {}
  async deleteAll() {}

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
    return this.dataSource.query(query, [id]);
  }
}
