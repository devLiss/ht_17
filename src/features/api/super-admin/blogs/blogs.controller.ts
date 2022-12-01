import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogQueryDto } from '../../public/blogs/dto/blogQuery.dto';
import { CommandBus } from '@nestjs/cqrs';
import { BasicAuthGuard } from '../../../../common/guards/basicAuth.guard';
import { GetAllBlogsCommand } from './application/useCases/getAllBlogs.useCase';
import { BanBlogCommand } from './application/useCases/banBlog.useCase';

@Controller('sa/blogs')
//
export class SABlogsController {
  constructor(private commandBus: CommandBus) {}

  @UseGuards(BasicAuthGuard)
  @Put(':id/ban')
  @HttpCode(204)
  async banBlog(@Param('id') id: string, @Body('isBanned') isBanned: boolean) {
    await this.commandBus.execute(new BanBlogCommand(id, isBanned));
  }

  @Put(':id/bind-with-user/:userId')
  async bindBlogWithUser() {}

  //@UseGuards(BasicAuthGuard)
  @Get()
  async getAllBlogs(@Query() bqDto: BlogQueryDto) {
    return this.commandBus.execute(new GetAllBlogsCommand(bqDto));
  }
}
