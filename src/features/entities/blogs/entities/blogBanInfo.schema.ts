import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema({ _id: false, versionKey: false })
export class BlogBanInfo {
  @Prop()
  isBanned: boolean;

  @Prop()
  banDate: Date;
}

export const BlogBanInfoSchema = SchemaFactory.createForClass(BlogBanInfo);
