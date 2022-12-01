import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

export class BasicAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    console.log('HEADERS');
    console.log(req.header('Authorization'));
    const header = req.header('Authorization');
    if (!header) {
      throw new UnauthorizedException();
    }
    const matchArr = header.match(/^Basic (.*)$/);
    if (!matchArr) {
      throw new UnauthorizedException();
    }
    const [login, passwd] = Buffer.from(matchArr[1], 'base64')
      .toString()
      .split(':');
    if (login === 'admin' && passwd === 'qwerty') {
      return true;
    } else {
      throw new UnauthorizedException();
    }
    //return undefined;
  }
}
