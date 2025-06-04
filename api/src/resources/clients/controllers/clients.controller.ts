import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleSheetsService } from 'src/resources/google-sheets/services/google-sheets.service';
import { ClientDto } from '../dto/clients.dto';
import { SheetDataDto } from 'src/resources/google-sheets/dto/sheet-data.dto';
import { EmailStatus } from '../enum/email-status.enum';
import * as luxon from 'luxon';

@Controller('clients')
export class ClientsController {
  constructor(
    private readonly googleSheetsService: GoogleSheetsService,
    private readonly configServ: ConfigService,
  ) {}

  @Get()
  async findAll() {
    const sheetData: SheetDataDto = await this.googleSheetsService.getSheetData(
      this.configServ.getOrThrow<string>('WORKSHEET_ID'),
    );
    const clientsData: ClientDto[] = sheetData.values.slice(1).map((row) => {
      return {
        id: row[0],
        name: row[1],
        email: row[2],
        lastEmailSentDate: row[3]
          ? luxon.DateTime.fromFormat(row[3], 'dd/M/yyyy HH:mm:ss', {
              zone: 'America/New_York',
            })
          : null,
        lastEmailSentStatus: row[4]
          ? row[4] === EmailStatus.OPENED
            ? EmailStatus.OPENED
            : EmailStatus.SENT
          : null,
      };
    });
    return clientsData;
  }
}
