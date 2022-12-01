import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { BlogQueryRepository } from '../../features/entities/mongo/blogs/infrastructure/blog-query.repository';

@Injectable()
export class CheckExistingBlogMiddleware implements NestMiddleware {
  constructor(private blogQueryRepo: BlogQueryRepository) {}
  async use(req: Request, res: Response, next: NextFunction) {
    console.log('Middleware -->', req.params.blogId);
    const blog = await this.blogQueryRepo.findBlogById(req.params.blogId);
    console.log(blog);
    if (!blog) {
      console.log('Throw exception');
      throw new NotFoundException([
        { message: 'Blog not exists', field: 'blodId' },
      ]);
    }
    next();
  }
}
