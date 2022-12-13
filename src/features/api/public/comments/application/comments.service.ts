import { Injectable } from '@nestjs/common';
import { CommentsRepository } from '../../../../entities/mongo/comment/infrastucture/comments.repository';
import { CommentsQueryRepository } from '../../../../entities/mongo/comment/infrastucture/comments-query.repository';
import { LikesRepository } from '../../../../entities/mongo/comment/infrastucture/likes.repository';
import { LikesInfo } from '../../../../entities/mongo/comment/entities/likesInfo.schema';
import { Like } from '../../../../entities/mongo/comment/entities/likes.schema';
import * as mongoose from 'mongoose';
import { CommentsSqlRepository } from '../../../../entities/postgres/commentsSql.repository';

@Injectable()
export class CommentsService {
  constructor(
    protected commentRepo: CommentsRepository,
    protected commentQueryRepo: CommentsQueryRepository,
    private likesRepo: LikesRepository,
    private comRepo: CommentsSqlRepository,
  ) {}
  async createComment(content: string, postId: string, user: any) {
    const newComment = {
      content: content,
      postId: postId,
      userId: user.id,
      userLogin: user.login,
      createdAt: new Date().toISOString(),
    };

    const createdComment = await this.comRepo.create(newComment);
    console.log(createdComment);

    return createdComment;
  }
  async deleteComment(id: string) {
    return await this.commentRepo.deleteComment(id);
  }
  async updateComment(id: string, content: string) {
    return await this.commentRepo.updateComment(id, content);
  }

  /*async updateCommentBanInfo(user) {
    return this.commentRepo.updateUserInfo(user);
  }*/

  async deleteAllComments() {
    return await this.commentRepo.deleteAll();
  }

  async makeLike(commentId: string, user: any, status: string) {
    const commentIdDb = commentId;
    const existedLike = await this.likesRepo.getLikeByCommentIdAndUserId(
      commentId,
      user.id,
    );

    const likeInfo = {
      commentId: new mongoose.Types.ObjectId(commentId),
      userId: new mongoose.Types.ObjectId(user.id),
      login: user.login,
      isBanned: user.banInfo.isBanned,
      status,
      addedAt: new Date().toISOString(),
    };

    let like = null;
    if (existedLike) {
      like = await this.likesRepo.updateLike(likeInfo);
    } else {
      like = await this.likesRepo.createLike(likeInfo);
    }
    return like;
  }
}
