import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

enum likeStatus {
  None = 'None',
  Dislike = 'Dislike',
  Like = 'Like',
}
@Schema({ _id: false, versionKey: false })
export class LikesInfo {
  @Prop()
  likesCount: number;

  @Prop()
  dislikesCount: number;

  @Prop({ type: String, enum: likeStatus, default: likeStatus.None })
  myStatus: string;
}

export const LikesInfoSchema = SchemaFactory.createForClass(LikesInfo);
