import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { BlogQueryRepository } from '../../features/entities/mongo/blogs/infrastructure/blog-query.repository';

@ValidatorConstraint({ name: 'blogId', async: true })
@Injectable()
export class BlogIdValidation implements ValidatorConstraintInterface {
  constructor(private blogQueryRepo: BlogQueryRepository) {}

  async validate(
    value: any,
    validationArguments?: ValidationArguments,
  ): Promise<boolean> {
    console.log('validation');
    console.log(this.blogQueryRepo);
    const blogId = await this.blogQueryRepo.findBlogById(value);
    if (!blogId) return false;
    return true;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return "Blog doesn't exist";
  }
}
