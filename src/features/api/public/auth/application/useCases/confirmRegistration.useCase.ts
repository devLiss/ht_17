import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserQueryRepository } from '../../../../../entities/mongo/user/infrastructure/user-query.repository';
import { EmailService } from '../../../../../../emailManager/email.service';
import { UsersService } from '../../../../super-admin/users/application/users.service';
import { UserRepository } from '../../../../../entities/mongo/user/infrastructure/user.repository';
import { CodeDto } from '../../dto/code.dto';
import { UserSqlRepository } from '../../../../../entities/postgres/userSql.repository';

export class ConfirmRegCommand {
  constructor(public cDto: CodeDto) {}
}
@CommandHandler(ConfirmRegCommand)
export class ConfirmRegistrationUseCase
  implements ICommandHandler<ConfirmRegCommand>
{
  constructor(
    /*private userQueryRepo: UserQueryRepository,
    private userRepo: UserRepository,*/
    private userRepo: UserSqlRepository,
  ) {}
  async execute(command: ConfirmRegCommand) {
    console.log(command.cDto.code);

    const tempData = await this.userRepo.getEmailConfirmation();
    console.log(tempData);
    const user = await this.userRepo.getUserByEmailConfirmationCode(
      command.cDto.code,
    );
    console.log(user);
    if (!user) {
      return false;
    }
    if (user.isConfirmed) {
      return false;
    }
    console.log(user.userId);
    const result = await this.userRepo.acceptConfirmation(user.userId); //.updateConfirmationCode(user.userId);
    return true;
  }
}
