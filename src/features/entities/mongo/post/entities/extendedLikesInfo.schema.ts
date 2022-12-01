import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false, versionKey: false })
export class NewestLikes {
  addedAt: string;
  userId: string;
  login: string;
}
export const NewestLikesSchema = SchemaFactory.createForClass(NewestLikes);

@Schema({ _id: false, versionKey: false })
export class ExtendedLikesInfo {
  @Prop()
  likesCount: number;
  @Prop()
  dislikesCount: number;
  @Prop()
  myStatus: string;
  @Prop()
  newestLikes: NewestLikes[];
}

export const ELISchema = SchemaFactory.createForClass(ExtendedLikesInfo);
