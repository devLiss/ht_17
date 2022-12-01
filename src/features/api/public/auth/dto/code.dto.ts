import { Validate } from 'class-validator';
import { ConfirmCodeValidator } from '../../../../../common/validators/confirmCode.validator';

export class CodeDto {
  @Validate(ConfirmCodeValidator)
  code: string;
}
