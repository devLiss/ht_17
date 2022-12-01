import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../entities/user.schema';
import { BanDto } from '../../../../api/super-admin/users/dto/ban.dto';

export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(user: any) {
    const createdUser = new this.userModel(user);
    await createdUser.save();
    return createdUser;
  }

  async deleteUser(id: string) {
    console.log(id);

    const result = await this.userModel.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }

  async deleteAll(): Promise<boolean> {
    const result = await this.userModel.deleteMany({});
    return result.deletedCount === 1;
  }

  async updateConfirmation(id: string) {
    const result = await this.userModel.updateOne(
      { id: id },
      { $set: { 'emailConfirmation.isConfirmed': true } },
    );
    return result.modifiedCount === 1;
  }

  async updateConfirmationCode(id: string, code: string) {
    const result = await this.userModel.updateOne(
      { id: id },
      { $set: { 'emailConfirmation.confirmationCode': code } },
    );
    return result.modifiedCount === 1;
  }

  async createRecoveryData(
    userId: any,
    recovery: {
      recoveryCode: string;
      expirationDate: Date;
      isConfirmed: boolean;
    },
  ) {
    const user = await this.userModel.updateOne(
      { _id: userId },
      { $set: { recoveryData: recovery } },
    );
    const updatedUser = await this.userModel.findOne({ id: userId });
    console.log(updatedUser);
    return updatedUser;
  }
  async confirmPassword(
    userId: string,
    passwordData: { passwordSalt: string; passwordHash: string },
  ) {
    const user = await this.userModel.findOneAndUpdate(
      { id: userId },
      {
        $set: {
          'recoveryData.isConfirmed': true,
          passwordHash: passwordData.passwordHash,
          passwordSalt: passwordData.passwordSalt,
        },
      },
    );
    return user;
  }

  async banUser(id: string, banDto: BanDto) {
    const user = await this.userModel.findById(id);
    if (!user) return false;

    console.log('BanDto');
    console.log(banDto);
    user.banInfo.banReason = null;
    user.banInfo.banDate = new Date().toISOString();
    user.banInfo.isBanned = banDto.isBanned;
    if (banDto.isBanned) {
      user.banInfo.banReason = banDto.banReason;
      user.banInfo.banDate = new Date().toISOString();
    }

    user.save();
    return user;
  }
}
