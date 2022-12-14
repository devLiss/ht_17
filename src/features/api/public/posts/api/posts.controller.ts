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
import { PostQueryDto } from '../dto/postQuery.dto';
import { BearerAuthGuard } from '../../../../../common/guards/bearerAuth.guard';
import { CommentsService } from '../../comments/application/comments.service';
import { User } from '../../../../../common/decorators/user.decorator';
import { UpdateCommentDto } from '../../comments/dto/updateComment.dto';
import { LikeStatusDto } from '../../comments/dto/likeStatus.dto';
import { Request } from 'express';
import * as mongoose from 'mongoose';
import { JwtService } from '../../sessions/application/jwt.service';
import { PostSqlRepository } from '../../../../entities/postgres/postSql.repository';
import { UserSqlRepository } from '../../../../entities/postgres/userSql.repository';
import { BlogsSqlRepository } from '../../../../entities/postgres/blogsSql.repository';
import { CommandBus } from '@nestjs/cqrs';
import { MakeLikeCommand } from '../../comments/application/handlers/makeLike.handler';
import { BlogBannedUsersSqlRepository } from '../../../../entities/postgres/blogBannedUsersSql.repository';
import { CommentsSqlRepository } from '../../../../entities/postgres/commentsSql.repository';

@Controller('posts')
export class PostsController {
  constructor(
    private jwtService: JwtService,
    private postRepo: PostSqlRepository,
    private userRepo: UserSqlRepository,
    private commentService: CommentsService,
    private blogRepo: BlogsSqlRepository,
    private commandBus: CommandBus,
    private blogBannedUsers: BlogBannedUsersSqlRepository,
    private commentRepo: CommentsSqlRepository,
  ) {}

  @UseGuards(BearerAuthGuard)
  @Put(':postId/like-status')
  @HttpCode(204)
  async makeLike(
    @Param('postId') id: string,
    @Body() lsDto: LikeStatusDto,
    @User() user,
  ) {
    const post = await this.postRepo.getPostById(id);
    if (!post) throw new NotFoundException();

    await this.commandBus.execute(
      new MakeLikeCommand(id, 'post', user.id, lsDto.likeStatus),
    );
  }

  @Get(':postId/comments')
  async getCommentByPostId(
    @Param('postId') postId: string,
    @Query() query: PostQueryDto,
    @Req() req: Request,
  ) {
    const post = await this.postRepo.getPostById(postId);
    if (!post) throw new NotFoundException();

    let currentUserId = null;
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      console.log(token);
      const userId = await this.jwtService.getUserByAccessToken(token);
      console.log('UserId = ' + userId);

      if (userId) {
        const user = await this.userRepo.getUserById(userId.toString());
        if (user) {
          currentUserId = user.id;
        }
      }
    }
    const comments = await this.commentRepo.getCommentByPostId(
      postId,
      currentUserId,
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
    const post = await this.postRepo.getPostById(postId);
    if (!post) throw new NotFoundException();

    console.log(post.blogId);
    console.log(user.id);
    const result = await this.blogBannedUsers.getByBlogIdAndUserId(
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
    let currentUserId = null;
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      console.log(token);
      const userId = await this.jwtService.getUserByAccessToken(token);
      console.log('UserId = ' + userId);

      if (userId) {
        const user = await this.userRepo.getUserById(userId.toString());
        if (user) {
          currentUserId = user.id;
        }
      }
    }

    const data = await this.postRepo.getAllPosts(currentUserId, pqDto);
    return data;
  }

  //@UseGuards(CheckBlogBanGuard)
  @Get(':id')
  async getPostById(@Param('id') id: string, @Req() req: Request) {
    let currentUserId = null;
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

    const post = await this.postRepo.getPostByIdView(id, currentUserId);

    if (!post) throw new NotFoundException();
    const blog = await this.blogRepo.getById(post.blogId);
    if (blog.isBanned) throw new NotFoundException();
    return post;
  }
}
