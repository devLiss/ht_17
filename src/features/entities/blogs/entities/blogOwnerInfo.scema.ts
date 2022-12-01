import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false, versionKey: false })
export class BlogOwnerInfo {
  @Prop()
  userId: string;

  @Prop()
  userLogin: string;
}
export const BlogOwnerInfoSchema = SchemaFactory.createForClass(BlogOwnerInfo);
