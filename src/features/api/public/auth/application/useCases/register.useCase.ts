import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { UsersService } from '../../../../super-admin/users/application/users.service';
import { UserRepository } from '../../../../../entities/mongo/user/infrastructure/user.repository';
import { EmailService } from '../../../../../../emailManager/email.service';
import { CreateUserDto } from '../../../../super-admin/users/dto/create-user.dto';
import { UserSqlRepository } from '../../../../../entities/postgres/userSql.repository';

export class RegisterCommand {
  constructor(public cuDto: CreateUserDto) {}
}

@CommandHandler(RegisterCommand)
export class RegisterUseCase implements ICommandHandler<RegisterCommand> {
  constructor(
    private userService: UsersService,
    //private userRepo: UserRepository,
    private userRepo: UserSqlRepository,
    private mailService: EmailService,
  ) {}
  async execute(command: RegisterCommand) {
    console.log('create user');
    const passwordSalt = await bcrypt.genSalt(12);
    const passwordHash = await this.userService._generateHash(
      command.cuDto.password,
      passwordSalt,
    );

    const newUser = {
      login: command.cuDto.login,
      email: command.cuDto.email,
      passwordHash,
      passwordSalt,
      createdAt: new Date().toISOString(),
      emailConfirmation: {
        confirmationCode: uuidv4(),
        expirationDate: add(new Date(), { hours: 1, minutes: 3 }),
        isConfirmed: false,
      },
      banInfo: {
        isBanned: false,
        banDate: null,
        banReason: null,
      },
    };

    const createResult = await this.userRepo.createUser(newUser);
    try {
      this.mailService.sendConfirmation(newUser);
    } catch (e) {
      console.log(e);
    }
    return {
      id: createResult.id,
      login: createResult.login,
      email: createResult.email,
      createdAt: createResult.createdAt,
      banInfo: createResult.banInfo,
    };
  }
}
