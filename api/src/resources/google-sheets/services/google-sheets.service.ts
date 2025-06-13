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
  private readonly sheets = google.sheets({ version: 'v4', auth: this.auth });
  private readonly sheetId = this.configServ.getOrThrow<string>('WORKSHEET_ID');
  private readonly logger: ConsoleLogger = new ConsoleLogger(
    GoogleSheetsService.name,
  );

  constructor(private readonly configServ: ConfigService) {}

  async getSheetData(): Promise<any> {
    const readSheetRange = `${this.configServ.getOrThrow('CLIENTS_SHEET_NAME')}!A1:Z1000`;
    try {
      const sheet = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range: readSheetRange,
      });
      return sheet.data;
    } catch (error) {
      this.logger.error('Error fetching sheet data:', error);
      throw new BadGatewayException(
        'There was an error retrieving the sheet data, please contact support for more information.',
      );
    }
  }

  async writeSheet(params: {
    columnIndex: number;
    rowIndex: number;
    text: string;
  }) {
    // Convert column number to letter (A=1, B=2, ...)
    const columnLetter = String.fromCharCode(64 + params.columnIndex);
    const writeSheetRange = `${this.configServ.getOrThrow('CLIENTS_SHEET_NAME')}!${columnLetter}${params.rowIndex}`;
    try {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.sheetId,
        range: writeSheetRange,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[params.text]],
        },
      });
    } catch (error) {
      this.logger.error('Error fetching sheet data:', error);
      throw new BadGatewayException(
        'There was an error writing data to the sheet, please contact support for more information.',
      );
    }
  }

  async writeSheetRange(params: {
    text: string[][];
    columnStartIdx: number;
    rowStartIdx: number;
    columnEndIdx?: number;
    rowEndIdx?: number;
  }) {
    // Convert column number to letter (A=1, B=2, ...)
    const columnStartLetter = String.fromCharCode(64 + params.columnStartIdx);
    const columnEndLetter =
      params.columnEndIdx &&
      params.rowEndIdx &&
      String.fromCharCode(64 + params.columnEndIdx);
    // Construct the range
    const writeSheetRange = `${this.configServ.getOrThrow('CLIENTS_SHEET_NAME')}!${columnStartLetter}${params.rowStartIdx}${columnEndLetter ? ':' + columnEndLetter + params.rowEndIdx : ''}`;
    try {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.sheetId,
        range: writeSheetRange,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: params.text,
        },
      });
    } catch (error) {
      this.logger.error('Error fetching sheet data:', error);
      throw new BadGatewayException(
        'There was an error writing data to the sheet, please contact support for more information.',
      );
    }
  }
}
