import { IsEnum, Length } from 'class-validator';

export class LikeStatusDto {
  @Length(1)
  @IsEnum(['Like', 'Dislike', 'None'])
  likeStatus: string;
}
