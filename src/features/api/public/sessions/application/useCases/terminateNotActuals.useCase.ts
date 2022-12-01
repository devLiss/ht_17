import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '../jwt.service';
import { SessionsService } from '../sessions.service';

export class TerminateNotActualCommand {
  constructor(public refreshToken: string) {}
}

@CommandHandler(TerminateNotActualCommand)
export class TerminateNotActualsUseCase
  implements ICommandHandler<TerminateNotActualCommand>
{
  constructor(
    private jwtService: JwtService,
    private sessionService: SessionsService,
  ) {}

  async execute(command: TerminateNotActualCommand): Promise<any> {
    const payload = await this.jwtService.getPayloadByRefreshToken(
      command.refreshToken,
    );
    if (!payload) {
      throw new UnauthorizedException();
    }
    const isDeleted = await this.sessionService.removeSessionsByUserId(
      payload.userId,
      payload.deviceId,
    );

    return isDeleted;
  }
}
