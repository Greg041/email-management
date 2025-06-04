import { Module } from '@nestjs/common';
import { GoogleSheetsModule } from './resources/google-sheets/google-sheets.module';
import { ClientsModule } from './resources/clients/clients.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailsModule } from './resources/emails/emails.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailTemplate } from './resources/emails/entities/email-template.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.envs/.env' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        synchronize: true,
        entities: [EmailTemplate],
        ssl: configService.get<string>('NODE_ENV') === 'production',
      }),
      inject: [ConfigService],
    }),
    GoogleSheetsModule,
    EmailsModule,
    ClientsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
