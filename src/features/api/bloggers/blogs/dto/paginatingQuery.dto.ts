import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { transformSortDirection } from '../../../../../common/helpers/cast.helper';
import { SortOrder } from 'mongoose';

export class PaginatingQueryDto {
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

  @Transform(({ value }) => transformSortDirection(value))
  @IsOptional()
  @IsString()
  public sortDirection: SortOrder = 'desc';
}
