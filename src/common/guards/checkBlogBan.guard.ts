import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BlogQueryRepository } from '../../features/entities/mongo/blogs/infrastructure/blog-query.repository';
import { PostsQueryRepository } from '../../features/entities/mongo/post/infrastructure/posts-query.repository';
@Injectable()
export class CheckBlogBanGuard implements CanActivate {
  constructor(
    private blogQueryRepo: BlogQueryRepository,
    private postQRepo: PostsQueryRepository,
  ) {}
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const post = await this.postQRepo.getPostById(req.params.id);
    if (!post) throw new NotFoundException();

    const blog = await this.blogQueryRepo.findBlogById(post.blogId.toString());
    if (!blog) throw new NotFoundException();

    if (blog.banInfo.isBanned) throw new NotFoundException();
    return undefined;
  }
}
