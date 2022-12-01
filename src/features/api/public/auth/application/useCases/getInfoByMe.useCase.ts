import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserQueryRepository } from '../../../../../entities/mongo/user/infrastructure/user-query.repository';

export class GetInfo {
  constructor(public user: any) {}
}

@CommandHandler(GetInfo)
export class GetInfoByMeUseCase implements ICommandHandler<GetInfo> {
  constructor(private userQueryRepo: UserQueryRepository) {}
  async execute(command: GetInfo) {
    const findedUser = await this.userQueryRepo.findById(command.user.id);
    if (findedUser) {
      delete Object.assign(command.user, { ['userId']: command.user['id'] })[
        'id'
      ];
    }

    return {
      login: findedUser.login,
      email: findedUser.email,
      userId: findedUser.id,
    };
  }
}
