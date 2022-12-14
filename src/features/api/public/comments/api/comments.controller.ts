import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Headers,
  HttpCode,
  NotFoundException,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from '../application/comments.service';
import { CommentsQueryRepository } from '../../../../entities/mongo/comment/infrastucture/comments-query.repository';
import { BearerAuthGuard } from '../../../../../common/guards/bearerAuth.guard';
import { User } from '../../../../../common/decorators/user.decorator';
import { UpdateCommentDto } from '../dto/updateComment.dto';
import { LikeStatusDto } from '../dto/likeStatus.dto';
import { Request } from 'express';
import * as mongoose from 'mongoose';
import { JwtService } from '../../sessions/application/jwt.service';
import { UserQueryRepository } from '../../../../entities/mongo/user/infrastructure/user-query.repository';
import { CommandBus } from '@nestjs/cqrs';
import { MakeLikeCommand } from '../application/handlers/makeLike.handler';
import { CommentsSqlRepository } from '../../../../entities/postgres/commentsSql.repository';
import { DeleteCommentCommand } from '../application/handlers/deleteComment.handler';
import { UpdateCommentCommand } from '../application/handlers/updateComment.handler';
import { UserSqlRepository } from '../../../../entities/postgres/userSql.repository';

@Controller('comments')
export class CommentsController {
  constructor(
    protected commentsService: CommentsService,
    protected commentQueryRepo: CommentsQueryRepository,
    private jwtService: JwtService,
    private userQueryRepo: UserSqlRepository,
    private commentRepo: CommentsSqlRepository,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(BearerAuthGuard)
  @Put(':commentId/like-status')
  @HttpCode(204)
  async makeLike(
    @Param('commentId') id: string,
    @User() user,
    @Body() lsDto: LikeStatusDto,
  ) {
    const comment = await this.commentRepo.getCommentById(id /*, user.id*/);
    console.log(comment);
    if (!comment) {
      throw new NotFoundException();
    }
    const result = await this.commandBus.execute(
      new MakeLikeCommand(id, 'comment', user.id, lsDto.likeStatus),
    ); /*this.commentsService.makeLike(
      id,
      user,
      lsDto.likeStatus,
    );*/
  }

  @Get(':id')
  async getComment(
    @Headers('authorization') header: string,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    let currentUserId = null;
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      console.log(token);
      const userId = await this.jwtService.getUserByAccessToken(token);
      console.log('UserId = ' + userId);

      if (userId) {
        const user = await this.userQueryRepo.getUserById(userId);
        if (user) {
          currentUserId = user.id;
        }
      }
    }
    const comment = await this.commentRepo.getCommentByIdWithLikes(
      id,
      currentUserId,
    );

    if (!comment) throw new NotFoundException();
    return comment;
  }

  @UseGuards(BearerAuthGuard)
  @HttpCode(204)
  @Delete(':commentId')
  async deleteComment(
    @Param('commentId') id: string,
    @User() user,
    @Req() req: Request,
  ) {
    const comment = await this.commentRepo.getCommentById(id);
    if (!comment) {
      throw new NotFoundException();
    }

    if (comment.userId !== user.id) {
      throw new ForbiddenException();
    }

    const isDeleted = await this.commandBus.execute(
      new DeleteCommentCommand(id),
    ); //this.commentsService.deleteComment(comment.id);
    //if (!isDeleted) throw new NotFoundException();
  }

  @UseGuards(BearerAuthGuard)
  @Put(':commentId')
  @HttpCode(204)
  async updateComment(
    @User() user,
    @Param('commentId') id: string,
    @Body() ucDto: UpdateCommentDto,
  ) {
    const comment = await this.commentRepo.getCommentById(id);
    if (!comment) {
      throw new NotFoundException();
    }

    if (comment.userId !== user.id) {
      throw new ForbiddenException();
    }

    const isModified = await this.commandBus.execute(
      new UpdateCommentCommand(comment.id, ucDto.content),
    ); /*.updateComment(
      comment.id,
      ucDto.content,
    );*/
  }
}
