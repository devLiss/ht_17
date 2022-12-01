import { Length } from 'class-validator';

export class UpdateCommentDto {
  @Length(20, 300)
  content: string;
}
