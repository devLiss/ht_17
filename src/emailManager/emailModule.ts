import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 465,
          ignoreTLS: true,
          secure: true,
          auth: {
            user: configService.get<string>('SMTP_USER'),
            pass: configService.get<string>('SMTP_PASSWORD'),
          },
        },
        defaults: {
          from: '"No Reply" <no-reply@gmail.com>',
        },
        preview: false,
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    /*MailerModule.forRoot({
    transport:{
    host:process.env.SMTP_HOST,
    port:process.env.SMTP_PORT,
    secure:true,
    auth:{
      user:process.env.SMTP_USER,
      pass:process.env.SMTP_PASSWORD
    }
  },
    defaults:{
      from:'"Devliss" <devliss158@gmail.com>'
    },
    template: {
      dir: join(__dirname, 'templates'),//__dirname + '/templates',
      adapter: new HandlebarsAdapter(),
      /*options: {
        strict: true,
      },
    },
  })*/
  ],
  controllers: [],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
