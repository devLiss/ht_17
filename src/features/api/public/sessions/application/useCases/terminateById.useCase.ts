import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '../jwt.service';
import { SessionsService } from '../sessions.service';

export class TerminateByIdCommand {
  constructor(public refreshToken: string, public id: string) {}
}
@CommandHandler(TerminateByIdCommand)
export class TerminateByIdUseCase
  implements ICommandHandler<TerminateByIdCommand>
{
  constructor(
    private jwtService: JwtService,
    private sessionService: SessionsService,
  ) {}

  async execute(command: TerminateByIdCommand): Promise<any> {
    const payload = await this.jwtService.getPayloadByRefreshToken(
      command.refreshToken,
    );
    if (!payload) {
      throw new UnauthorizedException();
    }
    const session = await this.sessionService.getSessionByDeviceId(command.id);
    if (!session) {
      throw new NotFoundException();
    }

    const payloadUserId = payload.ObjectId;
    console.log(payloadUserId);
    if (session.userId !== payload.userId) {
      throw new ForbiddenException();
    }

    const isDeleted = await this.sessionService.removeSessionByDeviceId(
      payload.userId,
      command.id,
    );

    console.log(isDeleted);
  }
  /* */
}
