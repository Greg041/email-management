import { Module } from '@nestjs/common';
import { ClientsController } from './controllers/clients.controller';
import { GoogleSheetsModule } from '../google-sheets/google-sheets.module';

@Module({
  imports: [GoogleSheetsModule],
  controllers: [ClientsController],
})
export class ClientsModule {}
