import { Injectable } from '@nestjs/common';
import jwt, { verify } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtService {
  private secret;
  private refreshSecret;
  constructor(private configService: ConfigService) {
    this.secret =
      configService.get('JWT_SECRET', { infer: true }) || 'test_secret';
    this.refreshSecret =
      configService.get('JWT_REFRESH_SECRET', { infer: true }) ||
      'test_refresh_secret';
  }
  async generateTokens(userId: any, deviceId: string) {
    const token = jwt.sign(
      { userId: userId },
      process.env.JWT_SECRET /*this.secret*/,
      {
        expiresIn: '10h',
      },
    );
    const refreshToken = jwt.sign(
      { deviceId: deviceId, userId: userId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '20h' },
    );

    return {
      accessToken: token,
      refreshToken: refreshToken,
    };
  }
  async getUserByAccessToken(token: string) {
    try {
      const result: any = jwt.verify(token, this.secret);
      console.log(result.userId);
      return result.userId;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  async getPayloadByRefreshToken(refreshToken: string): Promise<any> {
    try {
      const result: any = jwt.verify(refreshToken, this.refreshSecret);
      console.log(result);
      return result;
    } catch (e) {
      console.log('Fall');
      console.log(e);
      return null;
    }
  }
  async getUserByRefreshToken(refreshToken: string) {
    try {
      const result: any = jwt.verify(refreshToken, this.refreshSecret);
      return result.userId;
    } catch (e) {
      return null;
    }
  }
}
