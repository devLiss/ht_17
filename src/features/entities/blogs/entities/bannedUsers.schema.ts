import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  BanInfoBlog,
  banInfoBlogSchema,
} from './banInfoBlog.schema';

@Schema({ versionKey: false, _id: false })
export class BannedUser {
  @Prop()
  id: string;

  @Prop()
  login: string;

  @Prop({ type: banInfoBlogSchema })
  banInfo: BanInfoBlog;
}

export const bannedUserSchema = SchemaFactory.createForClass(BannedUser);
