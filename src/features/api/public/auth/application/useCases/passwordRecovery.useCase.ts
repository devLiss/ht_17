import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import { UserQueryRepository } from '../../../../../entities/mongo/user/infrastructure/user-query.repository';
import { UserRepository } from '../../../../../entities/mongo/user/infrastructure/user.repository';
import { EmailService } from '../../../../../../emailManager/email.service';
import { UserSqlRepository } from '../../../../../entities/postgres/userSql.repository';

export class PasswordRecoveryCommand {
  constructor(public email: string) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    /*private userQueryRepo: UserQueryRepository,
    private userRepo: UserRepository,*/
    private userRepo: UserSqlRepository,
    private mailService: EmailService,
  ) {}

  async execute(command: PasswordRecoveryCommand): Promise<any> {
    const user = await this.userRepo.getUserByEmail(command.email);
    console.log(command.email);
    console.log(user);
    console.log('Recovery Code');
    if (!user) {
      console.log('User not found');
      return null;
    }

    const recoveryCode = uuidv4();
    const recoveryData = {
      recoveryCode: recoveryCode,
      expirationDate: add(new Date(), { hours: 1, minutes: 3 }),
      isConfirmed: false,
    };
    console.log(recoveryCode);
    const updatedUser = await this.userRepo.createRecoveryData(
      user.id,
      recoveryData,
    );
    const result = await this.mailService.sendRecoveryCode(updatedUser);
    return result;
  }
}
