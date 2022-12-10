import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { BlogQueryRepository } from '../../../entities/mongo/blogs/infrastructure/blog-query.repository';
import { BlogQueryDto } from './dto/blogQuery.dto';
import { PostsService } from '../posts/application/posts.service';
import { PostsQueryRepository } from '../../../entities/mongo/post/infrastructure/posts-query.repository';
import { Request } from 'express';
import mongoose from 'mongoose';
import { JwtService } from '../sessions/application/jwt.service';
import { BlogsSqlRepository } from '../../../entities/postgres/blogsSql.repository';
import { PostSqlRepository } from '../../../entities/postgres/postSql.repository';
import { UserSqlRepository } from '../../../entities/postgres/userSql.repository';

@Controller('blogs')
export class PublicBlogsController {
  constructor(
    //protected blogQueryRepo: BlogQueryRepository,
    private postCUService: PostsService,
    private postsQueryRepo: PostsQueryRepository,
    private jwtService: JwtService,
    private userQueryRepo: UserSqlRepository,
    //private blogRepo: BlogsSqlRepository,
    private blogRepo: BlogsSqlRepository,
    private postRepo: PostSqlRepository,
  ) {}

  @Get()
  async getAllBlogs(@Query() bqDto: BlogQueryDto) {
    const data = await this.blogRepo.getAllPublic(bqDto);
    return data;
  }

  @Get('/:blogId/posts')
  async getAllPostsByBlogId(
    @Param('blogId') blogId: string,
    @Query() bqDto: BlogQueryDto,
    @Req() req: Request,
  ) {
    let currentUserId = new mongoose.Types.ObjectId();
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      console.log(token);
      const userId = await this.jwtService.getUserByAccessToken(token);
      console.log('UserId = ' + userId);

      if (userId) {
        const user = await this.userQueryRepo.getUserById(userId.toString());
        if (user) {
          currentUserId = user.id;
        }
      }
    }
    console.log(bqDto);
    return await this.postRepo.getPostsByBlogId(blogId, bqDto, '');
  }

  @Get('/:id')
  async getBlogById(@Param('id') id: string) {
    const blog = await this.blogRepo.getById(id);
    console.log(blog);
    if (!blog) throw new NotFoundException();
    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
    };
  }
}
