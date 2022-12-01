import { IsString, Length } from "class-validator";

export class NewPasswordDto{
  @Length(6,20)
  newPassword:string

  @IsString()
  recoveryCode:string
}