import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { UserQueryRepository } from '../../../../../entities/mongo/user/infrastructure/user-query.repository';
import { EmailService } from '../../../../../../emailManager/email.service';
import { UsersService } from '../../../../super-admin/users/application/users.service';
import { UserRepository } from '../../../../../entities/mongo/user/infrastructure/user.repository';
import { UserSqlRepository } from '../../../../../entities/postgres/userSql.repository';

export class ResendEmailCommand {
  constructor(public email: string) {}
}

@CommandHandler(ResendEmailCommand)
export class ResendEmailUseCase implements ICommandHandler<ResendEmailCommand> {
  constructor(
    protected mailService: EmailService,
    private userService: UsersService,
    /*private userRepo: UserRepository, 
    private userQueryRepo: UserQueryRepository,*/
    private userRepo: UserSqlRepository,
  ) {}
  async execute(command: ResendEmailCommand): Promise<any> {
    const user = await this.userRepo.getConfirmInfoByUserEmail(command.email);
    console.log('RESEND ');
    console.log(user);
    if (!user) {
      return false;
    }
    if (user.isConfirmed) {
      return false;
    }
    const confirmCode = uuidv4();
    const updateRes = await this.userRepo.updateConfirmationCode(
      user.userId,
      confirmCode,
    );

    const u = await this.userRepo.getConfirmInfoByUserEmail(command.email);
    console.log(u);
    const td = await this.userRepo.getUserByEmailConfirmationCode(confirmCode);
    console.log(td);

    console.log(updateRes);
    //user = await this.userRepo.getUserByEmail(command.email);
    try {
      const result = await this.mailService.sendConfirmation(
        command.email,
        confirmCode,
      );
    } catch (e) {
      console.log(e);
    }

    return true;
  }
}
