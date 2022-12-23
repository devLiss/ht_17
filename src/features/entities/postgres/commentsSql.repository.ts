import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PaginatingQueryDto } from '../../api/bloggers/blogs/dto/paginatingQuery.dto';
import { PostQueryDto } from '../../api/public/posts/dto/postQuery.dto';
import { uuid } from 'uuidv4';

export class CommentsSqlRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async create(comment: any) {
    const query = `insert into comments ("content","createdAt", "userId", "postId") values ($1, $2, $3, $4) returning id`;
    const createdComment = await this.dataSource.query(query, [
      comment.content,
      comment.createdAt,
      comment.userId,
      comment.postId,
    ]);
    //,
    //

    const commentId = createdComment[0].id;
    const q = `select c.id, c."content" ,c."userId" , u.login as "userLogin", c."createdAt", (select count(*) from likes l where l."likeableType" ='comment' and l.status = 'Like' and l."likeableId" =c.id ) as "likesCount" ,
    (select count(*) from likes l where l."likeableType" ='comment' and l.status = 'Dislike' and l."likeableId" =c. id ) as "dislikesCount",
    coalesce((select  l.status from likes l where l."likeableType" ='comment' and l."likeableId" = c.id and l."userId" = '${uuid()}'  ),'None') as "myStatus"
    from "comments" c join users u on c."userId" = u.id where c.id = '${commentId}'`;
    console.log(q);
    const crComment = await this.dataSource.query(q);
    console.log(crComment);
    const temp = crComment.map((item) => {
      const t = {
        id: item.id,
        content: item.content,
        userId: item.userId,
        userLogin: item.userLogin,
        createdAt: item.createdAt,
        likesInfo: {
          likesCount: +item.likesCount,
          dislikesCount: +item.dislikesCount,
          myStatus: item.myStatus,
        },
      };
      return t;
    });
    console.log(temp);
    return temp[0];
  }

  async deleteById(id: string) {
    return this.dataSource.query(`delete from comments where id = '${id}'`);
  }

  async update(id: string, content: string) {
    const query = `update comments set content = '${content}' where id = '${id}'`;
    return this.dataSource.query(query);
  }

  async getCommentById(id: string) {
    const query = `select * from comments where id = '${id}'`;
    const comment = await this.dataSource.query(query);
    console.log(comment);
    return comment.length ? comment[0] : null;
  }

  async getCommentByIdWithLikes(id: string, userId: string) {
    let subquery = ``;
    if (userId) {
      subquery = `,coalesce((select  l.status from likes l where l."likeableType" ='comment' and l."likeableId" = c.id and l."userId" = '${userId}'  ),'None') as "myStatus"`;
    }
    /*const query = `select c.id, c."content" ,c."userId" , u.login as "userLogin", c."createdAt", (select count(*) from likes l where l."likeableType" ='comment' and l.status = 'Like' and l."likeableId" =c.id ) as "likesCount" ,
    (select count(*) from likes l where l."likeableType" ='comment' and l.status = 'Dislike' and l."likeableId" =c.id ) as "dislikesCount" 
     ${subquery}
    from "comments" c join users u on c."userId" = u.id where c.id  = '${id}'`;*/

    /*   select count(*) from likes l left join "appBan" ab on l."userId" = ab."userId" where status = 'Like' and ab."isBanned" isnull  */
    const query = `select c.id, c."content" ,c."userId" , u.login as "userLogin", c."createdAt", (select count(*) from likes l left join "appBan" ab on l."userId" = ab."userId" where l."likeableType" ='comment' and l.status = 'Like' and l."likeableId" =c.id and ab."isBanned" isnull ) as "likesCount" ,
    (select count(*) from likes l left join "appBan" ab on l."userId" = ab."userId" where l."likeableType" ='comment' and l.status = 'Dislike' and l."likeableId" =c.id and ab."isBanned" isnull  ) as "dislikesCount" 
     ${subquery}
    from "comments" c join users u on c."userId" = u.id left join "appBan" ab on c."userId" = ab."userId" where c.id  = '${id}' and ab."isBanned" isnull`;

    const comments = await this.dataSource.query(query);
    const temp = comments.map((item) => {
      const t = {
        id: item.id,
        content: item.content,
        userId: item.userId,
        userLogin: item.userLogin,
        createdAt: item.createdAt,
        likesInfo: {
          likesCount: +item.likesCount,
          dislikesCount: +item.dislikesCount,
          myStatus: item.myStatus ? item.myStatus : 'None',
        },
      };
      return t;
    });

    return temp.length ? temp[0] : null;
  }

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

    let subquery = ``;
    if (userId) {
      subquery = `,coalesce((select  l.status from likes l where l."likeableType" ='comment' and l."likeableId" = c.id and l."userId" = '${userId}'  ),'None') as "myStatus"`;
    }
    const query = `select c.id, c."content" ,c."userId" , u.login as "userLogin", c."createdAt", (select count(*) from likes l left join "appBan" ab on l."userId" = ab."userId" where l."likeableType" ='comment' and l.status = 'Like' and l."likeableId" =c.id and ab."isBanned" isnull) as "likesCount" ,
    (select count(*) from likes l left join "appBan" ab on l."userId" = ab."userId" where l."likeableType" ='comment' and l.status = 'Dislike' and l."likeableId" =c.id and ab."isBanned" isnull   ) as "dislikesCount" ${subquery}
    from "comments" c join users u on c."userId" = u.id where c."postId" = '${postId}' order by ${orderBy} ${pagination.sortDirection} limit ${pagination.pageSize} offset ${offset}`;

    console.log(query);
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
          likesCount: +item.likesCount,
          dislikesCount: +item.dislikesCount,
          myStatus: item.myStatus ? item.myStatus : 'None',
        },
      };
      return t;
    });

    return {
      pagesCount: Math.ceil(+total[0].count / pagination.pageSize),
      page: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount: +total[0].count,
      items: temp,
    };
  }

  async getCommentsForBlogger(id: string, pqDto: PaginatingQueryDto) {
    const offset = (pqDto.pageNumber - 1) * pqDto.pageSize;
    const orderBy =
      pqDto.sortBy != 'createdAt'
        ? `"${pqDto.sortBy}" COLLATE "C"`
        : `c."${pqDto.sortBy}"`;

    const query = `select c."content" , c."createdAt", c.id , c."userId" as "userId", u.login as "userLogin", b.name as "blogName" , b.id as "blogId",
    p.id as "postId", p.title,
    (select count(*) as "likesCount"  from likes l where l."likeableType" ='comment' and l.status = 'Like' and l."likeableId" = c.id ) as "likesCount" ,
    (select count(*) as "dislikesCount" from likes l where l."likeableType" ='comment' and l.status = 'Dislike' and l."likeableId" =c.id ) as "dislikesCount",
    coalesce((select  l.status from likes l where l."likeableType" ='comment' and l."likeableId" = c.id and l."userId" = '7298a66e-43dc-465e-9a09-ed8538712c49'  ),'None') as MyStatus
    from "comments" c left join posts p on c."postId" = p.id 
    left join blogs b on p."blogId" = b.id
    left join users u on c."userId" = u.id where b."ownerId" = '${id}' order by ${orderBy}  ${pqDto.sortDirection} limit ${pqDto.pageSize} offset ${offset}`;

    const comments = await this.dataSource.query(query);

    const totalQuery = `select count(*) from comments c left join posts p on c."postId" = p.id left join blogs b on p."blogId" = b.id where b."ownerId" = '${id}' `;
    const total = await this.dataSource.query(totalQuery);

    console.log(comments);
    console.log(total);
    const temp = comments.map((item) => {
      const t = {
        id: item.id,
        content: item.content,
        createdAt: item.createdAt,
        likesInfo: {
          likesCount: +item.likesCount,
          dislikesCount: +item.dislikesCount,
          myStatus: item.myStatus ? item.myStatus : 'None',
        },
        commentatorInfo: {
          userId: item.userId,
          userLogin: item.userLogin,
        },
        postInfo: {
          id: item.postId,
          title: item.title,
          blogId: item.blogId,
          blogName: item.blogName,
        },
      };
      return t;
    });

    return {
      pagesCount: Math.ceil(+total[0].count / pqDto.pageSize),
      page: pqDto.pageNumber,
      pageSize: pqDto.pageSize,
      totalCount: +total[0].count,
      items: temp,
    };
  }
}
