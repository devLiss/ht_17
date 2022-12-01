import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UserQueryRepository } from '../../features/entities/mongo/user/infrastructure/user-query.repository';

@Injectable()
export class CheckExistingUserMiddleware implements NestMiddleware {
  constructor(private userQueryRepo: UserQueryRepository) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const userByLogin = await this.userQueryRepo.findByLogin(req.body.login);
    const userByEmail = await this.userQueryRepo.getByEmail(req.body.email);
    console.log(userByLogin);
    console.log(userByEmail);
    if (userByLogin) {
      throw new BadRequestException([
        { message: 'User already exists', field: 'login' },
      ]);
    }
    if (userByEmail) {
      console.log('Throw exception');
      throw new BadRequestException([
        { message: 'User already exists', field: 'email' },
      ]);
    }
    next();
  }
}
