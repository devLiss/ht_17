import {
  Body,
  Controller,
  Delete,
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
import { BlogInputModelDto } from '../dto/blogInputModel.dto';
import { BearerAuthGuard } from '../../../../../common/guards/bearerAuth.guard';
import { PostInputModelDto } from '../dto/postInputModel.dto';
import { CreateBlogCommand } from '../application/useCases/createBlog.useCase';
import { CommandBus } from '@nestjs/cqrs';
import { User } from '../../../../../common/decorators/user.decorator';
import { BlogQueryDto } from '../../../public/blogs/dto/blogQuery.dto';
import { GetBlogsCommand } from '../application/useCases/getBlogs.useCase';
import { DeleteBlogCommand } from '../application/useCases/deleteBlog.useCase';
import { CheckBlogGuard } from '../../../../../common/guards/checkBlog.guard';
import { UpdateBlogCommand } from '../application/useCases/updateBlog.useCase';
import { Request } from 'express';
import { CreatePostCommand } from '../application/useCases/createPost.useCase';
import { UpdatePostCommand } from '../application/useCases/updatePost.useCase';
import { DeletePostCommand } from '../application/useCases/deletePost.useCase';
import { PaginatingQueryDto } from '../dto/paginatingQuery.dto';
import { GetCommentsCommand } from '../application/useCases/getComments.useCase';

@Controller('blogger/blogs')
@UseGuards(BearerAuthGuard)
export class BlogsController {
  constructor(private commandBus: CommandBus) {}

  @Get('comments')
  async getCommentForAllBlogs(
    @Query() paginatingQuery: PaginatingQueryDto,
    @User() user,
  ) {
    return this.commandBus.execute(
      new GetCommentsCommand(paginatingQuery, user),
    );
  }

  @UseGuards(BearerAuthGuard, CheckBlogGuard)
  @Delete(':id')
  @HttpCode(204)
  async deleteBlog(@Param('id') id: string, @User() user) {
    return this.commandBus.execute(new DeleteBlogCommand(id));
  }

  @UseGuards(BearerAuthGuard, CheckBlogGuard)
  @Put(':id')
  @HttpCode(204)
  async updateBlog(@Param('id') id: string, @Body() blog: BlogInputModelDto) {
    return this.commandBus.execute(new UpdateBlogCommand(id, blog));
  }

  @UseGuards(BearerAuthGuard, CheckBlogGuard)
  @Post(':id/posts')
  async createPost(
    @Param('id') id: string,
    @Body() post: PostInputModelDto,
    @Req() req: Request,
  ) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    return this.commandBus.execute(new CreatePostCommand(post, req.blog));
  }

  @UseGuards(BearerAuthGuard, CheckBlogGuard)
  @Put(':id/posts/:postId')
  @HttpCode(204)
  async updatePost(
    @Param('postId') id: string,
    @Body() post: PostInputModelDto,
  ) {
    const isUpdated = await this.commandBus.execute(
      new UpdatePostCommand(id, post),
    );
    if (!isUpdated)
      throw new NotFoundException({
        message: "Blod doesn't exist",
        field: 'blogId',
      });
  }

  @UseGuards(BearerAuthGuard, CheckBlogGuard)
  @Delete(':id/posts/:postId')
  @HttpCode(204)
  async deletePost(@Param('postId') postId: string) {
    const isDeleted = await this.commandBus.execute(
      new DeletePostCommand(postId),
    );
    if (!isDeleted) throw new NotFoundException();
  }

  @UseGuards(BearerAuthGuard)
  @Post()
  async createBlog(@Body() blog: BlogInputModelDto, @User() user) {
    console.log(user);
    return this.commandBus.execute(new CreateBlogCommand(blog, user));
  }

  @UseGuards(BearerAuthGuard)
  @Get()
  async getAllBlogs(@Query() bqDto: BlogQueryDto, @User() user) {
    console.log(user);
    return this.commandBus.execute(new GetBlogsCommand(bqDto, user.id));
  }
}
