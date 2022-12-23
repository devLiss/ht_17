import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostInputModelDto } from '../../api/bloggers/blogs/dto/postInputModel.dto';
import { BlogQueryDto } from '../../api/public/blogs/dto/blogQuery.dto';
import { PostQueryDto } from '../../api/public/posts/dto/postQuery.dto';

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

  async getPostByIdView(id: string, userId: string) {
    const userForLikes = userId ? `'${userId}'` : `b."ownerId"`;

    let subQuery = ``;
    if (userId) {
      subQuery = `,
      coalesce((select  l.status as "myStatus" from likes l where l."likeableType" ='post' and l."likeableId" = p.id and l."userId" = '${userId}'  ),'None') as "myStatus"`;
    }
    console.log(userId);
    const query = `select  p.*, b.name as "blogName", (select row_to_json(x2) from (
      select * from (
      select count(*) as "likesCount" from likes l left join "appBan" ab on l."userId" = ab."userId" where l."likeableType" ='post' and l.status = 'Like' and l."likeableId" =p.id and ab."isBanned" isnull ) as likesCount ,
      (select count(*) as "dislikesCount" from likes l left join "appBan" ab on l."userId" = ab."userId" where l."likeableType" ='post' and l.status = 'Dislike' and l."likeableId" =p.id and ab."isBanned" isnull ) as dislikesCount ${subQuery} ) x2)as "extendedLikesInfo",
      
      (select array_to_json(array_agg( row_to_json(t))) from (select l2."createdAt" as "addedAt" , l2."userId" as "userId" ,u.login as login
      from likes l2 left join users u on l2."userId" = u.id left join "appBan" ab on l2."userId" = ab."userId" where l2.status = 'Like' and l2."likeableType"  = 'post'
      and l2."likeableId"  = p.id and ab."isBanned" isnull order by l2."createdAt" desc limit 3) t) as "newestLikes" 
        from  posts p  join blogs b on p."blogId" = b.id where p.id = '${id}'`;

    console.log(query);
    const posts = await this.dataSource.query(query);
    const temp = posts.map((item) => {
      const t = {
        title: item.title,
        content: item.content,
        shortDescription: item.shortDescription,
        createdAt: item.createdAt,
        id: item.id,
        blogId: item.blogId,
        blogName: item.blogName,
        extendedLikesInfo: {
          likesCount: item.extendedLikesInfo.likesCount,
          dislikesCount: item.extendedLikesInfo.dislikesCount,
          myStatus: item.extendedLikesInfo.myStatus
            ? item.extendedLikesInfo.myStatus
            : 'None',
          newestLikes: item.newestLikes ? item.newestLikes : [],
        },
      };
      return t;
    });
    return temp.length ? temp[0] : null;
  }

  async getPostsByBlogId(
    blogId: string,
    bqDto: BlogQueryDto,
    currentId: string,
  ) {
    const offset = (bqDto.pageNumber - 1) * bqDto.pageSize;
    const orderBy =
      bqDto.sortBy != 'createdAt'
        ? `"${bqDto.sortBy}" COLLATE "C"`
        : `p."${bqDto.sortBy}"`;

    let subQuery = ``;
    if (currentId) {
      subQuery = `,
      coalesce((select  l.status as "myStatus" from likes l where l."likeableType" ='post' and l."likeableId" = p.id and l."userId" = '${currentId}'  ),'None') as "myStatus"`;
    }
    const query = `select 
      p.*, b.name as "blogName", (select row_to_json(x2) from (select * from (select count(*) as "likesCount" from likes l left join "appBan" ab on l."userId" = ab."userId" where l."likeableType" ='post' and l.status = 'Like' and l."likeableId" = p.id and ab."isBanned" isnull 
      ) as likesCount,
      (select count(*) as "dislikesCount" from likes l left join "appBan" ab on l."userId" = ab."userId" where l."likeableType" ='post' and l.status = 'Dislike' and l."likeableId" =p.id and ab."isBanned" isnull  ) as dislikesCount ${subQuery} ) x2)as "extendedLikesInfo",
      (select array_to_json(array_agg( row_to_json(t))) from (select l2."createdAt" as "addedAt" , l2."userId" as "userId" ,u.login as login
      from likes l2 left join users u on l2."userId" = u.id left join "appBan" ab on l2."userId" = ab."userId" where l2.status = 'Like' and l2."likeableType"  = 'post'
      and l2."likeableId"  = p.id and ab."isBanned" isnull order by l2."createdAt" desc limit 3) t) as "newestLikes" 
        from  posts p  join blogs b on p."blogId" = b.id where p."blogId" = '${blogId}' order by ${orderBy} ${bqDto.sortDirection} limit ${bqDto.pageSize} offset ${offset}`;

    const posts = await this.dataSource.query(query);

    const totalQuery = `select count(*) from posts p join blogs b on p."blogId" = b.id where p."blogId"='${blogId}'`;
    const totalCount = await this.dataSource.query(totalQuery);

    const temp = posts.map((item) => {
      const t = {
        title: item.title,
        content: item.content,
        shortDescription: item.shortDescription,
        createdAt: item.createdAt,
        id: item.id,
        blogId: item.blogId,
        blogName: item.blogName,
        extendedLikesInfo: {
          likesCount: item.extendedLikesInfo.likesCount,
          dislikesCount: item.extendedLikesInfo.dislikesCount,
          myStatus: item.extendedLikesInfo.myStatus
            ? item.extendedLikesInfo.myStatus
            : 'None',
          newestLikes: item.newestLikes ? item.newestLikes : [],
        },
      };
      return t;
    });
    return {
      pagesCount: Math.ceil(+totalCount[0].count / bqDto.pageSize),
      page: bqDto.pageNumber,
      pageSize: bqDto.pageSize,
      totalCount: +totalCount[0].count,
      items: temp,
    };
  }

  async getAllPosts(userId: string, pqDto: PostQueryDto) {
    const offset = (pqDto.pageNumber - 1) * pqDto.pageSize;

    if (pqDto.sortBy == 'blogName') {
      pqDto.sortBy = 'name';
    }
    const orderBy =
      pqDto.sortBy != 'createdAt'
        ? `"${pqDto.sortBy}" COLLATE "C"`
        : `b."${pqDto.sortBy}"`;

    console.log(userId);
    let subQuery = ``;
    if (userId) {
      subQuery = `,
      coalesce((select  l.status as "myStatus" from likes l where l."likeableType" ='post' and l."likeableId" = p.id and l."userId" = '${userId}'  ),'None') as "myStatus"`;
    }
    const query = `select 
      p.*, b.name as "blogName", (select row_to_json(x2) from (select * from (select count(*) as "likesCount" from likes l left join "appBan" ab on l."userId" = ab."userId" where l."likeableType" ='post' and l.status = 'Like' and l."likeableId" =p.id and ab."isBanned" isnull ) as likesCount ,
      (select count(*) as "dislikesCount" from likes l left join "appBan" ab on l."userId" = ab."userId" where l."likeableType" ='post' and l.status = 'Dislike' and l."likeableId" = p.id and ab."isBanned" isnull ) as dislikesCount ${subQuery}) x2)as "extendedLikesInfo",
      (select array_to_json(array_agg( row_to_json(t))) from (select l2."createdAt" as "addedAt" , l2."userId" as "userId" ,u.login as login
      from likes l2 left join users u on l2."userId" = u.id left join "appBan" ab on l2."userId" = ab."userId" where l2.status = 'Like' and l2."likeableType"  = 'post'
      and l2."likeableId"  = p.id and ab."isBanned" isnull order by l2."createdAt" desc limit 3) t) as "newestLikes" 
        from  posts p  join blogs b on p."blogId" = b.id order by ${orderBy} ${pqDto.sortDirection} limit ${pqDto.pageSize} offset ${offset}`;

    console.log(query);

    const posts = await this.dataSource.query(query);
    console.log(posts);
    const temp = posts.map((item) => {
      const t = {
        title: item.title,
        content: item.content,
        shortDescription: item.shortDescription,
        createdAt: item.createdAt,
        id: item.id,
        blogId: item.blogId,
        blogName: item.blogName,
        extendedLikesInfo: {
          likesCount: item.extendedLikesInfo.likesCount,
          dislikesCount: item.extendedLikesInfo.dislikesCount,
          myStatus: item.extendedLikesInfo.myStatus
            ? item.extendedLikesInfo.myStatus
            : 'None',
          newestLikes: item.newestLikes ? item.newestLikes : [],
        },
      };
      return t;
    });

    const totalCount = await this.dataSource.query(
      `select count(*) from posts p join blogs b on p."blogId" = b.id where b."isBanned" = false`,
    );
    console.log(totalCount);
    return {
      pagesCount: Math.ceil(+totalCount[0].count / pqDto.pageSize),
      page: pqDto.pageNumber,
      pageSize: pqDto.pageSize,
      totalCount: +totalCount[0].count,
      items: temp,
    };
  }
}
