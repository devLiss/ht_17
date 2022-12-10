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

import { CommandBus } from '@nestjs/cqrs';
import { BearerAuthGuard } from '../../../../../common/guards/bearerAuth.guard';
import { BloggerUserQueryDto } from '../dto/bloggerUserQuery.dto';
import { BloggerBanUserDto } from '../../blogs/dto/bloggerBanUser.dto';
import { CheckBlogInBodyGuard } from '../../../../../common/guards/checkBlogInBody.guard';
import { BanUserCommand } from '../application/useCases/banUser.useCase';
import { GetBannedUsersForBlogsCommand } from '../application/useCases/getBannedUsersForBlogs.useCase';
import { CheckUserGuard } from '../../../../../common/guards/checkUser.guard';
import { CheckBlogGuard } from '../../../../../common/guards/checkBlog.guard';

@Controller('blogger/users')
@UseGuards(BearerAuthGuard)
export class BloggerUsersController {
  constructor(private commandBus: CommandBus) {}

  @UseGuards(CheckBlogGuard)
  @Get('blog/:id')
  getBannedUsers(
    @Param('id') id: string,
    @Query() buqDto: BloggerUserQueryDto,
  ) {
    return this.commandBus.execute(
      new GetBannedUsersForBlogsCommand(id, buqDto),
    );
  }

  @UseGuards(CheckBlogInBodyGuard, CheckUserGuard)
  @Put(':id/ban')
  @HttpCode(204)
  banUser(@Param('id') id: string, @Body() banInfo: BloggerBanUserDto) {
    return this.commandBus.execute(new BanUserCommand(id, banInfo));
  }
}
