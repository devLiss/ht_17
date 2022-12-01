import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { LikesInfo } from '../../comment/entities/likesInfo.schema';
import { BlogOwnerInfo, BlogOwnerInfoSchema } from './blogOwnerInfo.scema';
import { BannedUser, bannedUserSchema } from './bannedUsers.schema';
import { BlogBanInfo, BlogBanInfoSchema } from './blogBanInfo.schema';
export type BlogDocument = Blog & Document;

@Schema({ versionKey: false })
export class Blog {
  _id: mongoose.Types.ObjectId;
  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop()
  websiteUrl: string;

  @Prop()
  createdAt: string;

  @Prop({ type: BlogOwnerInfoSchema })
  blogOwnerInfo: BlogOwnerInfo;

  @Prop({ type: BlogBanInfoSchema })
  banInfo: BlogBanInfo;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
