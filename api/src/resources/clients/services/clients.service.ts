import { Injectable } from '@nestjs/common';
import { ClientDto } from '../dto/clients.dto';
import * as luxon from 'luxon';
import { EmailStatus } from '../../emails/enum/email-status.enum';

@Injectable()
export class ClientService {
  getClientFromSheetValues(sheetRowsData: string[][]): ClientDto[] {
    return sheetRowsData.map((rowData) => ({
      id: rowData[0],
      name: rowData[1],
      email: rowData[2],
      lastEmailSentDate: rowData[3]
        ? luxon.DateTime.fromFormat(rowData[3], 'dd/M/yyyy HH:mm:ss', {
            zone: 'America/New_York',
          })
        : null,
      lastEmailSentStatus: rowData[4]
        ? rowData[4] === EmailStatus.OPENED
          ? EmailStatus.OPENED
          : EmailStatus.SENT
        : null,
    }));
  }
}
