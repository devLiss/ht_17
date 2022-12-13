import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { createDeflateRaw } from 'zlib';

export class LikesSqlRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async create(
    likeableId: string,
    likeableType: string,
    userId: string,
    like: { addedAt: string; status: string },
  ) {
    const query = `insert into likes ("likeableId","likeableType", "userId", "status", "createdAt") values ($1,$2,$3,$4,$5)`;
    const createdLike = await this.dataSource.query(query, [
      likeableId,
      likeableType,
      userId,
      like.status,
      like.addedAt,
    ]);
    return createdLike;
  }

  async update(
    likeableId: string,
    likeableType: string,
    userId: string,
    like: { addedAt: string; status: string },
  ) {
    const query = `update likes set status = '${like.status}', "createdAt" = '${like.addedAt}' where "userId" = '${userId}' and "likeableId"='${likeableId}' and "likeableType" = '${likeableType}'`;
    console.log(query);
    const updatedLike = await this.dataSource.query(query);
    return updatedLike;
  }
  async deleteLike(likeableId: string, likeableType: string, userId: string) {
    return this.dataSource.query(
      `delete from likes where "userId" = '${userId}' and "likeableId"='${likeableId}' and "likeableType" = '${likeableType}'`,
    );
  }
  async deleteAll() {}

  async getLikeByParentIdAndUserId(
    likeableId: string,
    likeableType: string,
    userId: string,
  ) {
    const query = `select * from likes where "userId" = '${userId}' and "likeableId"='${likeableId}' and "likeableType" = '${likeableType}'`;
    const like = await this.dataSource.query(query);
    return like.length ? like[0] : null;
  }
}
