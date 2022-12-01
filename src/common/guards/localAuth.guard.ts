import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserQueryRepository } from '../../features/entities/mongo/user/infrastructure/user-query.repository';
import { UsersService } from '../../features/api/super-admin/users/application/users.service';
import { LoginDto } from '../../features/api/public/auth/dto/login.dto';

@Injectable()
export class LocalAuthGuard implements CanActivate {
  constructor(
    private userQueryRepo: UserQueryRepository,
    private userService: UsersService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const loginDto: LoginDto = req.body;
    console.log(loginDto);
    const user = await this.checkCreds(loginDto);
    if (!user) throw new UnauthorizedException();
    if (user.banInfo.isBanned) throw new UnauthorizedException();

    req.user = user;
    return true;
  }

  async checkCreds(loginDto) {
    const user = await this.userQueryRepo.findByLoginOrEmail(
      loginDto.loginOrEmail,
    );
    console.log('User in creds with login ---> ' + loginDto.login);
    console.log(user);
    if (!user) return null;
    const passwordHash = await this.userService._generateHash(
      loginDto.password,
      user.passwordSalt,
    );
    if (user.passwordHash !== passwordHash) {
      return null;
    }
    return user;
  }
}
