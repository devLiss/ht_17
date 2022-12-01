import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false, versionKey: false })
export class BanInfo {
  @Prop()
  isBanned: boolean;
  @Prop()
  banDate: string;
  @Prop()
  banReason: string;
}

export const BanInfoSchema = SchemaFactory.createForClass(BanInfo);
