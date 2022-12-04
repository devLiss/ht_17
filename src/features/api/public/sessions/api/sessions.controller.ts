import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '../application/jwt.service';
import { SessionsService } from '../application/sessions.service';
import { RefreshToken } from '../../../../../common/decorators/cookies.decorator';
import { CommandBus } from '@nestjs/cqrs';
import { TerminateByIdCommand } from '../application/useCases/terminateById.useCase';
import { TerminateNotActualCommand } from '../application/useCases/terminateNotActuals.useCase';

@Controller('security/devices')
export class SessionsController {
  constructor(
    private jwtService: JwtService,
    private sessionService: SessionsService,
    private commandBus: CommandBus,
  ) {}
  @Get()
  async geSessionsByUser(@RefreshToken() refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    const payload = await this.jwtService.getPayloadByRefreshToken(
      refreshToken,
    );
    if (!payload) {
      throw new UnauthorizedException();
    }
    const sessions = await this.sessionService.getSessionsByUserId(
      payload.userId,
    );

    const sessionTemp = sessions.map((item) => {
      return {
        ip: item.ip,
        title: item.title,
        lastActiveDate: item.lastActiveDate,
        deviceId: item.deviceId,
      };
    });
    return sessionTemp;
  }

  @Delete()
  @HttpCode(204)
  async terminateNotActualSessions(@RefreshToken() refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const isDeleted = await this.commandBus.execute(
      new TerminateNotActualCommand(refreshToken),
    );

    if (!isDeleted) {
      throw new UnauthorizedException();
    }
    return true;
  }

  @Delete(':deviceId')
  @HttpCode(204)
  async terminateSessionById(
    @RefreshToken() refreshToken: string,
    @Param('deviceId') id: string,
  ) {
    const isDeleted = await this.commandBus.execute(
      new TerminateByIdCommand(refreshToken, id),
    );
    //if (!isDeleted) throw new NotFoundException();
    return true;
  }
}
