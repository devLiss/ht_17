import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class PostQueryDto {
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  public pageNumber = 1;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  public pageSize = 10;

  @IsString()
  @IsOptional()
  public sortBy = 'createdAt';

  @IsString()
  @IsOptional()
  public sortDirection = 'desc';
}
