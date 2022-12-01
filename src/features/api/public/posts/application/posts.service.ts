import { PostsRepository } from '../../../../entities/mongo/post/infrastructure/posts.repository';
import { Injectable } from '@nestjs/common';
import { LikesRepository } from '../../../../entities/mongo/comment/infrastucture/likes.repository';
import * as mongoose from 'mongoose';
@Injectable()
export class PostsService {
  constructor(
    protected postRepo: PostsRepository,
    private likeRepo: LikesRepository,
  ) {}

  async deleteAllPosts() {
    return await this.postRepo.deleteAll();
  }
  async makeLike(postId: string, user: any, status: string) {
    console.log('Make like for post! -->', postId);
    console.log(status);
    const postIdDb = postId;
    console.log('USERID');
    console.log(user);
    const addedAt = new Date().toISOString();
    const existedLike = await this.likeRepo.getLikeByPostIdAndUserId(
      postId,
      user.id,
    );
    console.log(existedLike);
    const likeInfo: {
      postId: mongoose.Types.ObjectId;
      userId: mongoose.Types.ObjectId;
      login: string;
      isBanned: boolean;
      addedAt: string;
      status: string;
    } = {
      postId: new mongoose.Types.ObjectId(postId),
      userId: new mongoose.Types.ObjectId(user.id),
      login: user.login,
      addedAt,
      status,
      isBanned: user.banInfo.isBanned,
    };
    console.log(likeInfo);
    let like = null;
    if (existedLike) {
      like = await this.likeRepo.updatePostLike(likeInfo);
    } else {
      like = await this.likeRepo.createPostLike(likeInfo);
    }
    return like;
  }
}
