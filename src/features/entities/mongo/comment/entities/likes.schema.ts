import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type LikeDocument = Like & Document;
@Schema()
export class Like {
  @Prop()
  commentId: mongoose.Types.ObjectId;

  @Prop()
  postId: mongoose.Types.ObjectId;

  @Prop()
  addedAt: string;

  @Prop()
  userId: mongoose.Types.ObjectId;

  @Prop()
  login: string;

  @Prop()
  status: string;

  @Prop()
  isBanned: boolean;
}

export const LikeSchema = SchemaFactory.createForClass(Like);
