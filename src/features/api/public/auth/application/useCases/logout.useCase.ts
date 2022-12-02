import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsSqlRepository } from '../../../../../entities/postgres/sessionsSql.repository';

export class LogoutCommand {
  constructor(public payload: any) {}
}
@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand> {
  constructor(
    private sessionDbRepo: SessionsSqlRepository /*SessionRepository*/,
  ) {}

  async execute(command: LogoutCommand): Promise<any> {
    const session = await this.sessionDbRepo.getSessionByUserDeviceDate(
      /*getSessionByUserByDeviceAndByDate(*/
      command.payload.userId,
      command.payload.deviceId,
      new Date(command.payload.iat * 1000),
    );

    console.log('SESSION ');
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
