import { IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class UserQueryDto {
  @IsOptional()
  @IsEnum(['all', 'banned', 'notBanned'])
  public banStatus: string;

  @IsOptional()
  public searchLoginTerm = '';

  @IsOptional()
  public searchEmailTerm = '';

  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  public pageNumber = 1;

  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  public pageSize = 10;

  @IsOptional()
  public sortBy = 'createdAt';

  @IsOptional()
  public sortDirection = 'desc';
}
