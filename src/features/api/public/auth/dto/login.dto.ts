import { IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  loginOrEmail: string;

  @IsString()
  password: string;
}
