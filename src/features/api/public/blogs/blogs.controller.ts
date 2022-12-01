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
import { UserQueryRepository } from '../../../entities/mongo/user/infrastructure/user-query.repository';

@Controller('blogs')
export class PublicBlogsController {
  constructor(
    protected blogQueryRepo: BlogQueryRepository,
    private postCUService: PostsService,
    private postsQueryRepo: PostsQueryRepository,
    private jwtService: JwtService,
    private userQueryRepo: UserQueryRepository,
  ) {}

  @Get()
  async getAllBlogs(@Query() bqDto: BlogQueryDto) {
    const data = await this.blogQueryRepo.findAllBlogsPublic(bqDto);
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
        const user = await this.userQueryRepo.findById(userId.toString());
        if (user) {
          currentUserId = user.id;
        }
      }
    }
    console.log(bqDto);
    return await this.postsQueryRepo.getPostsByBlogId(
      blogId,
      bqDto,
      currentUserId,
    );
  }

  @Get('/:id')
  async getBlogById(@Param('id') id: string) {
    const blog = await this.blogQueryRepo.findBlogById(id);
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
