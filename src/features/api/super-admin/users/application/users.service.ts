import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../../../entities/mongo/user/infrastructure/user.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(protected userRepo: UserRepository) {}
  async _generateHash(password: string, salt: string) {
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }

  async generatePasswordHash(password: string) {
    const passwordSalt = await bcrypt.genSalt(12);
    const passwordHash = await this._generateHash(password, passwordSalt);

    return {
      passwordSalt: passwordSalt,
      passwordHash: passwordHash,
    };
  }

  async deleteAll() {
    return this.userRepo.deleteAll();
  }
}
