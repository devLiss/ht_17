import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserQueryRepository } from '../../../../../entities/mongo/user/infrastructure/user-query.repository';
import { UserSqlRepository } from '../../../../../entities/postgres/userSql.repository';

export class GetInfo {
  constructor(public user: any) {}
}

@CommandHandler(GetInfo)
export class GetInfoByMeUseCase implements ICommandHandler<GetInfo> {
  constructor(
    private userQueryRepo: UserSqlRepository /*UserQueryRepository*/,
  ) {}
  async execute(command: GetInfo) {
    const findedUser = await this.userQueryRepo.getUserById(command.user.id);

    return {
      login: findedUser.login,
      email: findedUser.email,
      userId: findedUser.id,
    };
  }
}
