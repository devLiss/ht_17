import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserQueryRepository } from '../../../../../entities/mongo/user/infrastructure/user-query.repository';
import { EmailService } from '../../../../../../emailManager/email.service';
import { UsersService } from '../../../../super-admin/users/application/users.service';
import { UserRepository } from '../../../../../entities/mongo/user/infrastructure/user.repository';
import { CodeDto } from '../../dto/code.dto';

export class ConfirmRegCommand {
  constructor(public cDto: CodeDto) {}
}
@CommandHandler(ConfirmRegCommand)
export class ConfirmRegistrationUseCase
  implements ICommandHandler<ConfirmRegCommand>
{
  constructor(
    private userQueryRepo: UserQueryRepository,
    private userRepo: UserRepository,
  ) {}
  async execute(command: ConfirmRegCommand) {
    const user = await this.userQueryRepo.getUserByCode(command.cDto.code);
    console.log(user);
    if (!user) {
      return false;
    }
    if (user.emailConfirmation.isConfirmed) {
      return false;
    }
    console.log(user.id);
    const result = await this.userRepo.updateConfirmation(user.id);
    return true;
  }
}
