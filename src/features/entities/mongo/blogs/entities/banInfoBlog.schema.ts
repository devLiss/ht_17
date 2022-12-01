import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false, _id: false })
export class BanInfoBlog {
  @Prop()
  isBanned: boolean;
  @Prop()
  banDate: Date;

  @Prop()
  banReason: string;
}
export const banInfoBlogSchema = SchemaFactory.createForClass(BanInfoBlog);
