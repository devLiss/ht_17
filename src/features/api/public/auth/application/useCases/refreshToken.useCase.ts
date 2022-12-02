import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '../../../sessions/application/jwt.service';
import { SessionRepository } from '../../../../../entities/mongo/session/infrastructure/session.repository';
import { SessionsSqlRepository } from '../../../../../entities/postgres/sessionsSql.repository';

export class RefreshTokenCommand {
  constructor(public refreshToken: string) {}
}
@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase
  implements ICommandHandler<RefreshTokenCommand>
{
  constructor(
    protected jwtService: JwtService,
    protected sessionDbRepo: SessionsSqlRepository /*SessionRepository*/,
  ) {}

  async execute(command: RefreshTokenCommand) {
    const payload = await this.jwtService.getPayloadByRefreshToken(
      command.refreshToken,
    );

    console.log('UPDATE SESSION PAYLOAD');
    console.log(payload);
    if (!payload) {
      return null;
    }
    const session = await this.sessionDbRepo.getSessionByUserDeviceDate(
      payload.userId,
      payload.deviceId,
      new Date(payload.iat * 1000),
    );

    console.log('Session');
    console.log(session);
    if (!session) {
      return null;
    }

    const tokens = await this.jwtService.generateTokens(
      payload.userId,
      payload.deviceId,
    );
    const newPayload = await this.jwtService.getPayloadByRefreshToken(
      tokens.refreshToken,
    );

    if (!newPayload) {
      console.log('null');
    }
    console.log(newPayload);
    await this.sessionDbRepo.updateSession(
      newPayload.userId,
      newPayload.deviceId,
      new Date(newPayload.exp * 1000),
      new Date(newPayload.iat * 1000),
    );
    console.log(tokens);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
