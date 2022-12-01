import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BannedUsersQueryRepo } from '../../features/entities/mongo/blogs/infrastructure/bannedUsers.query-repo';
import { PostQueryDto } from '../../features/api/public/posts/dto/postQuery.dto';
import { PostsQueryRepository } from '../../features/entities/mongo/post/infrastructure/posts-query.repository';

@Injectable()
export class CheckBanGuard implements CanActivate {
  constructor(
    private bannedUserRepo: BannedUsersQueryRepo,
    private postQueryRepo: PostsQueryRepository,
  ) {}
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

    const user = req.user;
    console.log(req.params.id);
    const post = await this.postQueryRepo.getPostById(req.params.id);

    console.log('dsfsd');
    console.log(req.url);
    console.log(post);
    console.log(user.id);

    if (!post) {
      throw new NotFoundException();
    }

    const result = await this.bannedUserRepo.getByBlogIdAndUserId(
      post.blogId.toString(),
      user.id,
    );

    console.log(result);

    if (result) {
      throw new ForbiddenException();
    }

    return true;
  }
}
