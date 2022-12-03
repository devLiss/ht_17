import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanDto } from '../../dto/ban.dto';
import { UserRepository } from '../../../../../entities/mongo/user/infrastructure/user.repository';
import { UserQueryRepository } from '../../../../../entities/mongo/user/infrastructure/user-query.repository';
import { CommentsRepository } from '../../../../../entities/mongo/comment/infrastucture/comments.repository';
import { SessionsService } from '../../../../public/sessions/application/sessions.service';
import { UserSqlRepository } from '../../../../../entities/postgres/userSql.repository';

export class BanUserCommand {
  constructor(public id: string, public banDto: BanDto) {}
}
@CommandHandler(BanUserCommand)
export class BanUserUseCase implements ICommandHandler<BanUserCommand> {
  constructor(
    // private userRepo: UserRepository,
    //private userQueryRepo: UserQueryRepository,
    private userRepo: UserSqlRepository,
    private commentRepo: CommentsRepository,
    private sessionService: SessionsService,
  ) {}

  async execute(command: BanUserCommand): Promise<any> {
    const bannedUser = await this.userRepo.banUser(command.id, command.banDto);
    console.log(bannedUser);
    //const comments = await this.commentRepo.updateUserInfo(bannedUser);
    const session = await this.sessionService.removeUserSessions(command.id);

    return bannedUser;
  }
}
