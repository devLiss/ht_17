import { IsNotEmpty, IsUrl, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBlogDto {
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  @Length(1, 15)
  public name: string;

  @Length(1, 100)
  @IsUrl()
  public youtubeUrl: string;
}
