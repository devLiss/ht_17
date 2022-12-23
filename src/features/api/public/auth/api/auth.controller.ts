import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Headers,
  Ip,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
  Req,
  Get,
} from '@nestjs/common';
import { CreateUserDto } from '../../../super-admin/users/dto/create-user.dto';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterCommand } from '../application/useCases/register.useCase';
import { LoginCommand } from '../application/useCases/login.useCase';
import { LoginDto } from '../dto/login.dto';
import dayjs from 'dayjs';
import { LocalAuthGuard } from '../../../../../common/guards/localAuth.guard';
import { User } from '../../../../../common/decorators/user.decorator';
import { Request, Response } from 'express';
import { PasswordRecoveryCommand } from '../application/useCases/passwordRecovery.useCase';
import { NewPasswordDto } from '../dto/newPassword.dto';
import { NewPasswordCommand } from '../application/useCases/newPassword.useCase';
import { RefreshToken } from '../../../../../common/decorators/cookies.decorator';
import { RefreshTokenCommand } from '../application/useCases/refreshToken.useCase';
import { ConfirmRegCommand } from '../application/useCases/confirmRegistration.useCase';
import { CodeDto } from '../dto/code.dto';
import { ResendEmailCommand } from '../application/useCases/resendEmail.useCase';
import { LogoutCommand } from '../application/useCases/logout.useCase';
import { JwtService } from '../../sessions/application/jwt.service';
import { BearerAuthGuard } from '../../../../../common/guards/bearerAuth.guard';
import { GetInfo } from '../application/useCases/getInfoByMe.useCase';

@Controller('auth')
export class AuthController {
  constructor(private commandBus: CommandBus, private jwtService: JwtService) {}

  //@UseGuards(ThrottlerGuard)
  @Post('password-recovery')
  @HttpCode(204)
  async passwordRecovery(@Body('email') email: string) {
    await this.commandBus.execute(new PasswordRecoveryCommand(email));
    //await this.authService.sendRecoveryCode(email);
    return true;
  }

  //@UseGuards(ThrottlerGuard)
  @Post('new-password')
  @HttpCode(204)
  async changePassword(@Body() npDto: NewPasswordDto) {
    const confirmation = await this.commandBus.execute(
      new NewPasswordCommand(npDto),
    );
    if (!confirmation) {
      throw new BadRequestException();
    }
  }

  //@UseGuards(ThrottlerGuard, LocalAuthGuard)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  async login(
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string,
    @Headers('user-agent') agent: string,
    @Body() loginDto: LoginDto,
    @User() user,
  ) {
    const session = await this.commandBus.execute(
      new LoginCommand(user, ip, agent),
    );

    if (!session) {
      throw new UnauthorizedException();
    }

    res.cookie('refreshToken', session.refreshToken, {
      secure: true,
      expires: dayjs().add(20, 'minutes').toDate(),
      httpOnly: true,
    });

    return { accessToken: session.accessToken };
  }

  @Post('refresh-token')
  @HttpCode(200)
  async refresh(
    @RefreshToken() refreshToken: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.commandBus.execute(
      new RefreshTokenCommand(refreshToken),
    );
    if (!tokens) {
      throw new UnauthorizedException();
    }
    console.log('TOKENS   ', tokens);
    res.cookie('refreshToken', tokens.refreshToken, {
      expires: dayjs().add(20, 's').toDate(),
      secure: true,
      httpOnly: true,
    });
    return {
      accessToken: tokens.accessToken,
    };
  }

  //@UseGuards(ThrottlerGuard)
  @Post('registration-confirmation')
  @HttpCode(204)
  async confirmRegistration(@Body() cDto: CodeDto) {
    const result = await this.commandBus.execute(new ConfirmRegCommand(cDto));

    console.log(result);
    if (!result)
      throw new BadRequestException([
        { message: 'Email is confirmed', field: 'code' },
      ]);
    return result;
  }

  // @UseGuards(ThrottlerGuard)
  @Post('registration')
  @HttpCode(204)
  async registration(@Body() newUser: CreateUserDto) {
    const createdUser = await this.commandBus.execute(
      new RegisterCommand(newUser),
    );

    if (!createdUser) {
      throw new BadRequestException([
        {
          message: 'Email is already exists',
          field: 'email',
        },
      ]);
    }
  }

  //@UseGuards(ThrottlerGuard)
  @Post('registration-email-resending')
  @HttpCode(204)
  async resendEmailConfirmation(@Body('email') email: string) {
    const resend = await this.commandBus.execute(new ResendEmailCommand(email));
    if (!resend)
      throw new BadRequestException([
        { message: 'Email has already confirmed', field: 'email' },
      ]);
  }

  @Post('logout')
  @HttpCode(204)
  async logout(
    @RefreshToken() refreshToken,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    const payload = await this.jwtService.getPayloadByRefreshToken(
      refreshToken,
    );
    if (!payload) {
      throw new UnauthorizedException();
    }

    const session = await this.commandBus.execute(new LogoutCommand(payload)); //this.sessionService.getSessionByDeviceIdUserId(

    console.log(payload);
    console.log(session);
    if (!session) {
      throw new UnauthorizedException();
    }
    /*await this.sessionService.removeSessionByDeviceId(
      payload.userId,
      payload.deviceId,
    );*/

    res.clearCookie('refreshToken');
  }

  @UseGuards(BearerAuthGuard)
  @Get('me')
  async getInfoAboutMe(@User() user: any) {
    const findedUser = await this.commandBus.execute(new GetInfo(user));
    console.log(findedUser);

    return findedUser; /*{
      login: findedUser.login,
      email: findedUser.email,
      userId: findedUser.id,
    };*/
  }
}
