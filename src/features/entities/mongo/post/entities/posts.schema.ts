import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ELISchema, ExtendedLikesInfo } from './extendedLikesInfo.schema';
import * as mongoose from 'mongoose';
export type PostDocument = Post & Document;
@Schema({ versionKey: false })
export class Post {
  @Prop()
  title: string;
  @Prop()
  content: string;
  @Prop()
  shortDescription: string;
  @Prop()
  blogName: string;
  @Prop()
  blogId: mongoose.Types.ObjectId;
  @Prop()
  createdAt: string;
  @Prop({ type: ELISchema })
  extendedLikesInfo: ExtendedLikesInfo;
}
export const PostSchema = SchemaFactory.createForClass(Post);
