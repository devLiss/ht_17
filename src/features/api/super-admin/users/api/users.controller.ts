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
import { UsersService } from '../application/users.service';
import { UserQueryRepository } from '../../../../entities/mongo/user/infrastructure/user-query.repository';
import { UserQueryDto } from '../dto/userQuery.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { BasicAuthGuard } from '../../../../../common/guards/basicAuth.guard';
import { BanDto } from '../dto/ban.dto';
import { Request } from 'express';
import { CommandBus } from '@nestjs/cqrs';
import { BanUserCommand } from '../application/useCases/banUser.useCase';
import { DeleteUserCommand } from '../application/useCases/deleteUser.useCase';
import { CheckUserGuard } from '../../../../../common/guards/checkUser.guard';
import { CreateUserCommand } from '../application/useCases/createUser.useCase';
import { UserSqlRepository } from '../../../../entities/postgres/userSql.repository';

@Controller('sa/users')
export class UsersController {
  constructor(
    protected userService: UsersService,
    protected userQueryRepo: UserQueryRepository,
    protected userSqlRepo: UserSqlRepository,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get()
  async getAllUsers(@Query() uqDto: UserQueryDto) {
    //const users = await this.userQueryRepo.getUsers(uqDto);
    const users = await this.userSqlRepo.getAllUsers(uqDto);
    return users;
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createUser(@Body() cuDto: CreateUserDto) {
    return this.commandBus.execute(new CreateUserCommand(cuDto));
  }

  @UseGuards(BasicAuthGuard, CheckUserGuard)
  @Delete('/:id')
  @HttpCode(204)
  async deleteUser(@Param('id') id: string) {
    const isDeleted = await this.commandBus.execute(new DeleteUserCommand(id));
    if (!isDeleted) throw new NotFoundException();

    return isDeleted;
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id/ban')
  @HttpCode(204)
  async banUser(
    @Param('id') id: string,
    @Body() banDto: BanDto,
    @Req() req: Request,
  ) {
    await this.commandBus.execute(new BanUserCommand(id, banDto));
  }
}
