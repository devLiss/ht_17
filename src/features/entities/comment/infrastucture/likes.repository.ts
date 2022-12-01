import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Like, LikeDocument } from '../entities/likes.schema';
import * as mongoose from 'mongoose';

export class LikesRepository {
  constructor(
    @InjectModel(Like.name) private likesModel: Model<LikeDocument>,
  ) {}
  async createLike(like: {
    commentId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    login: string;
    addedAt: string;
    status: string;
    isBanned: string;
  }) {
    const createdLike = new this.likesModel(like);
    await createdLike.save();
    return createdLike;
  }

  async updateLike(like: {
    commentId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    status: string;
  }) {
    const existedLike = await this.likesModel.findOne({
      commentId: new mongoose.Types.ObjectId(like.commentId),
      userId: new mongoose.Types.ObjectId(like.userId),
    });
    if (!existedLike) {
      return false;
    }
    existedLike.status = like.status;
    existedLike.save();
    return existedLike;
  }

  async createPostLike(like: {
    postId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    isBanned: boolean;
    login: string;
    addedAt: string;
    status: string;
  }) {
    const createdLike = new this.likesModel(like);
    createdLike.save();
    console.log(createdLike);
    return createdLike;
  }

  async updatePostLike(like: {
    postId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    login: string;
    addedAt: string;
    status: string;
  }) {
    const existedLike = await this.likesModel.findOne({
      postId: like.postId,
      userId: like.userId,
    });
    if (!existedLike) {
      return false;
    }
    existedLike.status = like.status;
    existedLike.save();
    return existedLike;
  }

  async getLikeByCommentIdAndUserId(commentId: string, userId: string) {
    return this.likesModel.findOne({
      commentId: new mongoose.Types.ObjectId(commentId),
      userId: new mongoose.Types.ObjectId(userId),
    });
  }

  async getLikeByPostIdAndUserId(postId: string, userId: string) {
    return this.likesModel.findOne({
      postId: new mongoose.Types.ObjectId(postId),
      userId: new mongoose.Types.ObjectId(userId),
    });
  }

  async getLikesAndDislikesByCommentId(commentId: string) {
    const counts = await this.likesModel.aggregate([
      { $match: { commentId: commentId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    return counts;
  }

  async deleteAll() {
    await this.likesModel.deleteMany({});
  }
}
