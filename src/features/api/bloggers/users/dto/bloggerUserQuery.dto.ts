import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { transformSortDirection } from '../../../../../common/helpers/cast.helper';

export class BloggerUserQueryDto {
  @IsOptional()
  searchNameTerm = '';

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  pageNumber = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  pageSize = 10;

  @IsOptional()
  sortBy = 'createdAt';

  @IsOptional()
  @Transform(({ value }) => transformSortDirection(value))
  sortDirection = 'desc';
}
