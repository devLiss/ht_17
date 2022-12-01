import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../../../../entities/mongo/user/infrastructure/user.repository';

export class DeleteUserCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(private userRepo: UserRepository) {}

  execute(command: DeleteUserCommand): Promise<any> {
    return this.userRepo.deleteUser(command.id);
  }
}
