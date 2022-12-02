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
    let user = await this.userRepo.getUserByEmail(command.email);
    console.log('RESEND ');
    if (!user) {
      return false;
    }
    if (user.emailConfirmation.isConfirmed) {
      return false;
    }
    const confirmCode = uuidv4();
    const updateRes = await this.userRepo.updateConfirmationCode(
      user.id,
      confirmCode,
    );
    user = await this.userRepo.getUserByEmail(command.email);
    const result = await this.mailService.sendConfirmation(user);
    return true;
  }
}
