import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from '../entities/comments.schema';
import { Like, LikeDocument } from '../entities/likes.schema';

export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
  ) {}

  /*async createComment(comment: any) {
    const createdComment = new this.commentModel(comment);
    await createdComment.save();

    delete createdComment.isBanned;
    delete createdComment.postId;
    createdComment.likesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
    };

    return createdComment.toJSON();
  }*/

  async updateUserInfo(user: any) {
    /**/
    console.log(user.id);
    const likes = await this.likeModel.updateMany(
      { userId: user._id },
      { $set: { isBanned: user.banInfo.isBanned } },
    );
    const comments = await this.commentModel.updateMany(
      { userId: user._id.toString() },
      { $set: { isBanned: user.banInfo.isBanned } },
    );
    console.log(comments);

    return true;
  }
  async updateComment(id: string, content: string) {
    const comment = await this.commentModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
    });
    if (!comment) {
      return false;
    }

    comment.content = content;
    comment.save();
    return true;
  }

  async deleteComment(id: string) {
    const result = await this.commentModel.deleteOne({
      _id: new mongoose.Types.ObjectId(id),
    });
    return result.deletedCount === 1;
  }

  async deleteAll(): Promise<boolean> {
    const result = await this.commentModel.deleteMany({});
    return result.deletedCount > 1;
  }
}
