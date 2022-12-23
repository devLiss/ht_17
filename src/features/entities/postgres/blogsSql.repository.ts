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
  async update(
    id: string,
    name: string,
    description: string,
    websiteUrl: string,
  ) {
    const query = `update blogs set name = $1, description = $2, "websiteUrl" = $3 where id = '${id}'`;
    await this.dataSource.query(query, [name, description, websiteUrl]);
    return true;
  }
  async deleteOne(id: string) {
    const query = `delete from blogs where id = $1`;
    return this.dataSource.query(query, [id]);
  }
  async deleteAll() {
    const query = `delete from blogs`;
    return this.dataSource.query(query);
  }

  async getAll(bqDto: BlogQueryDto) {
    const offset = (bqDto.pageNumber - 1) * bqDto.pageSize;

    const orderBy =
      bqDto.sortBy != 'createdAt'
        ? `"${bqDto.sortBy}" COLLATE "C"`
        : `b."${bqDto.sortBy}"`;
    //select b.id,b.name, b.description , b."websiteUrl" , b."createdAt", b."isBanned", b."banDate" , b."ownerId" as "userId", u.login as "userLogin" from blogs b left join users u on b."ownerId" = u.id
    const query = `select b.id,b.name, b.description , b."websiteUrl" , b."createdAt", b."isBanned", b."banDate" , b."ownerId" as "userId", u.login as "userLogin" from blogs b left join users u on b."ownerId" = u.id where name ilike '%${bqDto.searchNameTerm}%' order by ${orderBy} ${bqDto.sortDirection} limit $1 offset $2`;

    console.log(query);
    const blogs = await this.dataSource.query(query, [bqDto.pageSize, offset]);

    const totalQuery = `select count(*) from blogs where name ilike '%${bqDto.searchNameTerm}%' `;
    const totalCount = await this.dataSource.query(totalQuery);

    const mapped = blogs.map((item) => {
      const t = {
        id: item.id,
        name: item.name,
        description: item.description,
        websiteUrl: item.websiteUrl,
        createdAt: item.createdAt,
        blogOwnerInfo: {
          userId: item.userId,
          userLogin: item.userLogin,
        },
        banInfo: {
          isBanned: item.isBanned,
          banDate: item.banDate,
        },
      };
      return t;
    });
    console.log(totalCount);
    return {
      pagesCount: Math.ceil(+totalCount[0].count / bqDto.pageSize),
      page: bqDto.pageNumber,
      pageSize: bqDto.pageSize,
      totalCount: +totalCount[0].count,
      items: mapped,
    };
  }
  async getAllPublic(queryDto: BlogQueryDto) {
    const offset = (queryDto.pageNumber - 1) * queryDto.pageSize;

    const orderBy =
      queryDto.sortBy != 'createdAt'
        ? `"${queryDto.sortBy}" COLLATE "C"`
        : `"${queryDto.sortBy}"`;
    const query = `select id, name, description, "websiteUrl", "createdAt" from blogs where "isBanned" = false and name ilike '%${queryDto.searchNameTerm}%' order by ${orderBy} ${queryDto.sortDirection} limit $1 offset $2`;
    console.log(query);
    const blogs = await this.dataSource.query(query, [
      queryDto.pageSize,
      offset,
    ]);

    const totalQuery = `select count(*) from blogs where "isBanned" = false and name ilike '%${queryDto.searchNameTerm}%' `;
    const totalCount = await this.dataSource.query(totalQuery);

    return {
      pagesCount: Math.ceil(+totalCount[0].count / queryDto.pageSize),
      page: queryDto.pageNumber,
      pageSize: queryDto.pageSize,
      totalCount: +totalCount[0].count,
      items: blogs,
    };
  }
  async getAllByUser(bqDto: BlogQueryDto, userId: string) {
    const offset = (bqDto.pageNumber - 1) * bqDto.pageSize;
    const orderBy =
      bqDto.sortBy != 'createdAt'
        ? `"${bqDto.sortBy}" COLLATE "C"`
        : `"${bqDto.sortBy}"`;
    const query = `select id, name, description, "websiteUrl", "createdAt" from blogs where name ilike '%${bqDto.searchNameTerm}%' and "ownerId" = '${userId}'  order by ${orderBy} ${bqDto.sortDirection} limit $1 offset $2`;
    const blogs = await this.dataSource.query(query, [bqDto.pageSize, offset]);

    const totalQuery = `select count(*) from blogs where name ilike '%${bqDto.searchNameTerm}%' and "ownerId" = '${userId}'`;
    const totalCount = await this.dataSource.query(totalQuery);

    return {
      pagesCount: Math.ceil(+totalCount[0].count / bqDto.pageSize),
      page: bqDto.pageNumber,
      pageSize: bqDto.pageSize,
      totalCount: +totalCount[0].count,
      items: blogs,
    };
  }
  async getById(id: string) {
    const query = `select * from blogs where id=$1`;
    const blog = await this.dataSource.query(query, [id]);
    return blog.length ? blog[0] : null;
  }
  async banBlog(id: string, isBanned: boolean) {
    console.log('Ban blog');
    console.log(isBanned);

    const banDate = isBanned ? `'${new Date().toISOString()}'` : null;
    return this.dataSource.query(
      `update blogs set "isBanned" = ${isBanned}, "banDate" = ${banDate} where id = '${id}'`,
    );
  }
}
