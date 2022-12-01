import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserQueryRepository } from '../../features/entities/mongo/user/infrastructure/user-query.repository';
@Injectable()
export class CheckUserGuard implements CanActivate {
  constructor(private userQueryRepo: UserQueryRepository) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = await this.userQueryRepo.findById(req.params.id);
    if (!user) throw new NotFoundException();

    return true;
  }
}
