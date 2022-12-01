import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { BanInfoBlog, banInfoBlogSchema } from './banInfoBlog.schema';

export type BlogBannedUsersDoc = BlogBannedUsers & Document;
@Schema({ versionKey: false })
export class BlogBannedUsers {
  @Prop()
  blogId: mongoose.Types.ObjectId;

  @Prop()
  id: mongoose.Types.ObjectId;

  @Prop()
  login: string;

  @Prop({ type: banInfoBlogSchema })
  banInfo: BanInfoBlog;
}

export const BlogBannedUsersSchema =
  SchemaFactory.createForClass(BlogBannedUsers);
