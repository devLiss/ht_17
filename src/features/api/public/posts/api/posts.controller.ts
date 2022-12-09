import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from '../application/posts.service';
import { PostQueryDto } from '../dto/postQuery.dto';
import { PostsQueryRepository } from '../../../../entities/mongo/post/infrastructure/posts-query.repository';
import { CommentsQueryRepository } from '../../../../entities/mongo/comment/infrastucture/comments-query.repository';
import { BlogQueryRepository } from '../../../../entities/mongo/blogs/infrastructure/blog-query.repository';
import { BearerAuthGuard } from '../../../../../common/guards/bearerAuth.guard';
import { CommentsService } from '../../comments/application/comments.service';
import { User } from '../../../../../common/decorators/user.decorator';
import { UpdateCommentDto } from '../../comments/dto/updateComment.dto';
import { LikeStatusDto } from '../../comments/dto/likeStatus.dto';
import { Request } from 'express';
import * as mongoose from 'mongoose';
import { JwtService } from '../../sessions/application/jwt.service';
import { UsersService } from '../../../super-admin/users/application/users.service';
import { UserQueryRepository } from '../../../../entities/mongo/user/infrastructure/user-query.repository';
import { CheckBanGuard } from '../../../../../common/guards/checkBan.guard';
import { CheckBlogBanGuard } from '../../../../../common/guards/checkBlogBan.guard';
import { BannedUsersQueryRepo } from '../../../../entities/mongo/blogs/infrastructure/bannedUsers.query-repo';
import { PostSqlRepository } from '../../../../entities/postgres/postSql.repository';
import { UserSqlRepository } from '../../../../entities/postgres/userSql.repository';

@Controller('posts')
export class PostsController {
  constructor(
    private postService: PostsService,
    private postQueryRepo: PostsQueryRepository,
    private commentsQueryRepo: CommentsQueryRepository,
    private commentService: CommentsService,
    private blogQueryRepo: BlogQueryRepository,
    private jwtService: JwtService,
    private userQueryRepo: UserQueryRepository,
    private bannedUserRepo: BannedUsersQueryRepo,
    private postRepo: PostSqlRepository,
    private userRepo: UserSqlRepository,
  ) {}

  @UseGuards(BearerAuthGuard)
  @Put(':postId/like-status')
  @HttpCode(204)
  async makeLike(
    @Param('postId') id: string,
    @Body() lsDto: LikeStatusDto,
    @User() user,
  ) {
    const post = await this.postQueryRepo.getPostById(id);
    if (!post) throw new NotFoundException();

    await this.postService.makeLike(id, user, lsDto.likeStatus);
  }

  @Get(':postId/comments')
  async getCommentByPostId(
    @Param('postId') postId: string,
    @Query() query: PostQueryDto,
    @Req() req: Request,
  ) {
    const post = await this.postQueryRepo.getPostById(postId);
    if (!post) throw new NotFoundException();

    let currentUserId = new mongoose.Types.ObjectId();
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      console.log(token);
      const userId = await this.jwtService.getUserByAccessToken(token);
      console.log('UserId = ' + userId);

      if (userId) {
        const user = await this.userQueryRepo.findById(userId.toString());
        if (user) {
          currentUserId = user.id;
        }
      }
    }
    const comments = await this.commentsQueryRepo.getCommentsByPostId(
      currentUserId,
      postId,
      query,
    );
    return comments;
  }

  @UseGuards(BearerAuthGuard)
  @Post(':id/comments')
  @HttpCode(201)
  async createComment(
    @Param('id') postId: string,
    //TODO: повесить проверку на поле content
    @Body() ucDto: UpdateCommentDto,
    //TODO: изменить тип переменной
    @User() user: any,
    @Req() req: Request,
  ) {
    const post = await this.postQueryRepo.getPostById(postId);
    if (!post) throw new NotFoundException();

    console.log(post.blogId);
    console.log(user.id);
    const result = await this.bannedUserRepo.getByBlogIdAndUserId(
      post.blogId.toString(),
      user.id,
    );

    console.log(result);
    if (result) {
      throw new ForbiddenException();
    }
    const comment = await this.commentService.createComment(
      ucDto.content,
      postId,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      req.user,
    );

    return comment;
  }

  @Get()
  async getAllPosts(@Query() pqDto: PostQueryDto, @Req() req: Request) {
    let currentUserId = new mongoose.Types.ObjectId();
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      console.log(token);
      const userId = await this.jwtService.getUserByAccessToken(token);
      console.log('UserId = ' + userId);

      if (userId) {
        const user = await this.userQueryRepo.findById(userId.toString());
        if (user) {
          currentUserId = user.id;
        }
      }
    }

    const data = await this.postQueryRepo.findAllPosts(
      currentUserId,
      pqDto.pageNumber,
      pqDto.pageSize,
      pqDto.sortBy,
      pqDto.sortDirection,
    );
    return data;
  }

  //@UseGuards(CheckBlogBanGuard)
  @Get(':id')
  async getPostById(@Param('id') id: string, @Req() req: Request) {
    let currentUserId = new mongoose.Types.ObjectId();
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      console.log(token);
      const userId = await this.jwtService.getUserByAccessToken(token);
      console.log('UserId = ' + userId);

      if (userId) {
        const user = await this.userRepo.getUserById(userId);
        if (user) {
          currentUserId = user.id;
        }
      }
    }

    const post = await this.postRepo.getPostById(id);

    if (!post) throw new NotFoundException();
    post['extendedLikesInfo'] = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
      newestLikes: [],
    };
    //const blog = await this.blogQueryRepo.findBlogById(post.blogId);
    //if (blog.banInfo.isBanned) throw new NotFoundException();
    return post;
  }
}
