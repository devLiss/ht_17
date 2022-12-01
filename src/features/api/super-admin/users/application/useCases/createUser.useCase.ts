import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UsersService } from '../users.service';
import { UserRepository } from '../../../../../entities/mongo/user/infrastructure/user.repository';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { UserSqlRepository } from '../../../../../entities/postgres/userSql.repository';

export class CreateUserCommand {
  constructor(public cuDto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    private userService: UsersService,
    private userRepo: UserRepository,
    private userSqlRepo: UserSqlRepository,
  ) {}

  async execute(command: CreateUserCommand): Promise<any> {
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
      /*banInfo: {
        isBanned: false,
        banDate: null,
        banReason: null,
      },*/
    };

    //const createResult = await this.userRepo.createUser(newUser);
    const createResult = await this.userSqlRepo.createUser(newUser);
    console.log(createResult);
    return createResult; /*{
      id: createResult.id,
      login: createResult.login,
      email: createResult.email,
      createdAt: createResult.createdAt,
      //banInfo: createResult.banInfo,
    };*/
  }
}
