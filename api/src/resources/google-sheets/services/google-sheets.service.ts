import { BadGatewayException, ConsoleLogger, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';

@Injectable()
export class GoogleSheetsService {
  private readonly auth: any = new google.auth.GoogleAuth({
    keyFile: this.configServ.getOrThrow<string>(
      'GOOGLE_AUTH_CREDENTIALS_FILE_PATH',
    ),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  private readonly logger: ConsoleLogger = new ConsoleLogger(
    GoogleSheetsService.name,
  );

  constructor(private readonly configServ: ConfigService) {}

  async getSheetData(sheetId: string): Promise<any> {
    const sheets = google.sheets({ version: 'v4', auth: this.auth });
    const sheetRange = `${this.configServ.getOrThrow('CLIENTS_SHEET_NAME')}!A1:Z1000`;
    try {
      const sheet = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: sheetRange,
      });
      return sheet.data;
    } catch (error) {
      this.logger.error('Error fetching sheet data:', error);
      throw new BadGatewayException(
        'Hubo un error al obtener los datos de la hoja, por favor comuníquese con soporte para más información.',
      );
    }
  }
}
