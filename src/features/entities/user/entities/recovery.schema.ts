import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false, versionKey: false })
export class Recovery {
  @Prop()
  recoveryCode: string;
  @Prop()
  expirationDate: Date;
  @Prop()
  isConfirmed: boolean;
}

export const RecoverySchema = SchemaFactory.createForClass(Recovery);
