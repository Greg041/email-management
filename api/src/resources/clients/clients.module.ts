import { Module } from '@nestjs/common';
import { ClientsController } from './controllers/clients.controller';
import { GoogleSheetsModule } from '../google-sheets/google-sheets.module';
import { ClientService } from './services/clients.service';

@Module({
  imports: [GoogleSheetsModule],
  controllers: [ClientsController],
  providers: [ClientService],
  exports: [ClientService],
})
export class ClientsModule {}
