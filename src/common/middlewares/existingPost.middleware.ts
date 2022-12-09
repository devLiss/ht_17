import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PostsQueryRepository } from '../../features/entities/mongo/post/infrastructure/posts-query.repository';
import { PostSqlRepository } from '../../features/entities/postgres/postSql.repository';

@Injectable()
export class CheckExistingPostMiddleware implements NestMiddleware {
  constructor(private postQueryRepo: PostSqlRepository) {}
  async use(req: Request, res: Response, next: NextFunction) {
    console.log('Middleware -->', req.params.id);
    const blog = await this.postQueryRepo.getPostById(req.params.id);
    console.log(blog);
    if (!blog) {
      console.log('Throw exception');
      throw new NotFoundException([
        { message: 'Post not exists', field: 'postId' },
      ]);
    }
    next();
  }
}
