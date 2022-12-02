import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '../../../sessions/application/jwt.service';
import {
  User,
  UserDocument,
} from '../../../../../entities/mongo/user/entities/user.schema';
import { SessionRepository } from '../../../../../entities/mongo/session/infrastructure/session.repository';
import { SessionsSqlRepository } from '../../../../../entities/postgres/sessionsSql.repository';

export class LoginCommand {
  constructor(public user: any, public ip: string, public title: string) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand> {
  constructor(
    private jwtService: JwtService,
    private sessionRepo: SessionsSqlRepository /*SessionRepository*/,
  ) {}
  async execute(command: LoginCommand) {
    const userId = command.user.id.toString();
    const deviceId = uuidv4();

    const tokens = await this.jwtService.generateTokens(userId, deviceId);
    const payload = await this.jwtService.getPayloadByRefreshToken(
      tokens.refreshToken,
    );

    if (!payload) {
      return null;
    }
    console.log(payload);
    const session: any = {
      ip: command.ip,
      title: command.title,
      lastActiveDate: new Date(payload.iat * 1000),
      expiredDate: new Date(payload.exp * 1000),
      deviceId,
      userId,
    };
    const createdSession = await this.sessionRepo.createSession(session);

    console.log(createdSession);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
