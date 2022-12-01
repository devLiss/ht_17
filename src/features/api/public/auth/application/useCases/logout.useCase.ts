import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsService } from '../../../sessions/application/sessions.service';
import { SessionRepository } from '../../../../../entities/mongo/session/infrastructure/session.repository';

export class LogoutCommand {
  constructor(public payload: any) {}
}
@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand> {
  constructor(private sessionDbRepo: SessionRepository) {}

  async execute(command: LogoutCommand): Promise<any> {
    const session = await this.sessionDbRepo.getSessionByUserByDeviceAndByDate(
      command.payload.userId,
      command.payload.deviceId,
      new Date(command.payload.iat * 1000),
    );
    console.log(command.payload);
    console.log(session);
    if (!session) {
      return false;
    }
    await this.sessionDbRepo.removeSessionByDeviceId(
      command.payload.userId,
      command.payload.deviceId,
    );

    return true;
  }
}
