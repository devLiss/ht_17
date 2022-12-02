import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UserQueryRepository } from '../../features/entities/mongo/user/infrastructure/user-query.repository';
import { UserSqlRepository } from '../../features/entities/postgres/userSql.repository';

@Injectable()
export class CheckExistingConfirmCodeMiddleware implements NestMiddleware {
  constructor(
    private userQueryRepo: UserSqlRepository /*UserQueryRepository*/,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const user = await this.userQueryRepo.getUserByEmailConfirmationCode(
      req.body.code,
    );
    console.log(user);
    if (!user) {
      console.log("user doens't exist");
      throw new BadRequestException([
        {
          message: 'Code is incorrect, expired or already been applied',
          field: 'code',
        },
      ]);
    }

    console.log(user);
    const expiredDate = new Date(user.emailConfirmation.expiredDate);
    const isConfirmed = user.emailConfirmation.isConfirmed;
    if (isConfirmed) {
      console.log('Throw exception');
      throw new BadRequestException([
        {
          message: 'Code is incorrect, expired or already been applied',
          field: 'code',
        },
      ]);
    }
    next();
  }
}
