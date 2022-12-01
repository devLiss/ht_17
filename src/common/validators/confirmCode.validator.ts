import {
  ValidationArguments,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UserQueryRepository } from '../../features/entities/mongo/user/infrastructure/user-query.repository';
export class ConfirmCodeValidator implements ValidatorConstraintInterface {
  constructor(private userQueryRepo: UserQueryRepository) {}

  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'Code is incorrect or expired';
  }

  async validate(
    value: any,
    validationArguments?: ValidationArguments,
  ): Promise<boolean> {
    const user = await this.userQueryRepo.getUserByCode(value);
    if (!user) {
      console.log("user doens't exist");
      return false;
    }

    console.log(user);
    const expiredDate = new Date(user.emailConfirmation.expiredDate);
    const isConfirmed = user.emailConfirmation.isConfirmed;
    if (isConfirmed) {
      console.log('Throw exception');
      return false;
    }
    return true;
  }
}
