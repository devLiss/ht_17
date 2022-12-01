import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LikesInfo, LikesInfoSchema } from './likesInfo.schema';
import * as mongoose from 'mongoose';

export type CommentDocument = Comment & Document;

@Schema({ versionKey: false })
export class Comment {
  @Prop()
  content: string;
  @Prop()
  postId: mongoose.Types.ObjectId;
  @Prop()
  userId: mongoose.Types.ObjectId;
  @Prop()
  userLogin: string;
  @Prop()
  isBanned: boolean;
  @Prop()
  createdAt: Date;
  @Prop({ type: LikesInfoSchema })
  likesInfo: LikesInfo;
}
export const CommentSchema = SchemaFactory.createForClass(Comment);
