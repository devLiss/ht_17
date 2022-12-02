import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '../../features/api/public/sessions/application/jwt.service';
import { UserQueryRepository } from '../../features/entities/mongo/user/infrastructure/user-query.repository';
import { UserSqlRepository } from '../../features/entities/postgres/userSql.repository';

@Injectable()
export class BearerAuthGuard implements CanActivate {
  constructor(
    private userQueryRepo: UserSqlRepository, //UserQueryRepository,
    private jwtService: JwtService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    console.log('AuthGuard');
    if (!req.headers.authorization) {
      throw new UnauthorizedException();
    }
    const token = req.headers.authorization.split(' ')[1];

    const userId = await this.jwtService.getUserByAccessToken(token);
    console.log('userId ' + userId);
    console.log(userId);
    if (!userId) {
      throw new UnauthorizedException();
    }

    const user = await this.userQueryRepo.getUserById(userId);
    console.log(user);
    if (!user) {
      throw new UnauthorizedException();
    }
    req.user = user;
    return true;
  }
}
