import { IsBoolean, IsString, Length } from 'class-validator';

export class BanDto {
  @IsBoolean()
  isBanned: boolean;

  @IsString()
  @Length(20)
  banReason: string;
}
