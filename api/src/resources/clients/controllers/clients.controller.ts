import { Controller, Get } from '@nestjs/common';
import { GoogleSheetsService } from 'src/resources/google-sheets/services/google-sheets.service';
import { ClientDto } from '../dto/clients.dto';
import { SheetDataDto } from 'src/resources/google-sheets/dto/sheet-data.dto';
import { ClientService } from '../services/clients.service';

@Controller('clients')
export class ClientsController {
  constructor(
    private readonly googleSheetsService: GoogleSheetsService,
    private readonly clientServ: ClientService,
  ) {}

  @Get()
  async findAll() {
    const sheetData: SheetDataDto =
      await this.googleSheetsService.getSheetData();
    const clientsData: ClientDto[] = this.clientServ.getClientFromSheetValues(
      sheetData.values.slice(1),
    );
    return clientsData;
  }
}
