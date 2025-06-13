import { Module } from '@nestjs/common';
import { EmailsService } from './services/emails.service';
import { EmailsController } from './controllers/emails.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailTemplate } from './entities/email-template.entity';
import { GoogleSheetsModule } from '../google-sheets/google-sheets.module';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailTemplate]),
    GoogleSheetsModule,
    ClientsModule,
  ],
  controllers: [EmailsController],
  providers: [EmailsService],
})
export class EmailsModule {}
