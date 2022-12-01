import { IsNotEmpty, IsUrl, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class BlogInputModelDto {
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  @Length(1, 15)
  public name: string;

  @Length(1, 500)
  public description: string;

  @Length(1, 100)
  @IsUrl()
  public websiteUrl: string;
}
