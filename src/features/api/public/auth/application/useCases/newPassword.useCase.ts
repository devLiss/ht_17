import { NewPasswordDto } from '../../dto/newPassword.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserQueryRepository } from '../../../../../entities/mongo/user/infrastructure/user-query.repository';
import { UserRepository } from '../../../../../entities/mongo/user/infrastructure/user.repository';
import { EmailService } from '../../../../../../emailManager/email.service';
import { UsersService } from '../../../../super-admin/users/application/users.service';
import { UserSqlRepository } from '../../../../../entities/postgres/userSql.repository';

export class NewPasswordCommand {
  constructor(public npDto: NewPasswordDto) {}
}
@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCase implements ICommandHandler<NewPasswordCommand> {
  constructor(
    /*private userQueryRepo: UserQueryRepository,
    private userRepo: UserRepository,*/
    private userRepo: UserSqlRepository,
    private userService: UsersService,
  ) {}

  async execute(command: NewPasswordCommand): Promise<any> {
    const user = await this.userRepo.getUserByRecoveryCode(
      command.npDto.recoveryCode,
    );
    if (!user) {
      return false;
    }
    if (user.isConfirmed) {
      return false;
    }

    const passwordData = await this.userService.generatePasswordHash(
      command.npDto.newPassword,
    );
    console.log('confirm password');
    console.log(user);
    console.log(passwordData);
    await this.userRepo.confirmPassword(user.id, passwordData);
    return true;
  }
}
