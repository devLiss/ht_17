import { IsEmail, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(3, 10)
  login: string;

  @Length(6, 20)
  password: string;

  @IsEmail()
  email: string;
}
