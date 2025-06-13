import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { EmailsService } from '../services/emails.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { EmailTemplateDto } from '../dto/email-template.dto';
import { SendEmailDto } from '../dto/send-email.dto';
import { GenericResponseDto } from 'src/resources/common/dto/generic-response.dto';
import { GoogleSheetsService } from 'src/resources/google-sheets/services/google-sheets.service';
import { SheetDataDto } from 'src/resources/google-sheets/dto/sheet-data.dto';
import { ClientService } from 'src/resources/clients/services/clients.service';
import { ClientDto } from 'src/resources/clients/dto/clients.dto';
import * as luxon from 'luxon';
import { EmailStatus } from 'src/resources/emails/enum/email-status.enum';
import { ClientSheetColumnsMap } from 'src/resources/google-sheets/enum/client-sheet-column-map.enum';
import { Recipient } from 'mailersend';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('emails')
export class EmailsController {
  constructor(
    private readonly emailsService: EmailsService,
    private readonly sheetService: GoogleSheetsService,
    private readonly clientService: ClientService,
  ) {}

  @UseInterceptors(FileInterceptor('file'))
  @Post('templates')
  async uploadEmailTemplate(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'text/html',
          skipMagicNumbersValidation: true,
        })
        .build({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    file: Express.Multer.File,
  ) {
    const htmlContent = file.buffer.toString('utf-8');
    const htmlFileName = file.originalname;
    return this.emailsService.saveEmailTemplate(htmlFileName, htmlContent);
  }

  @Get('templates')
  async findAllEmailTemplates(): Promise<EmailTemplateDto[]> {
    return this.emailsService.findAllEmailTemplates();
  }

  @Delete('templates/:id')
  async deleteEmailTemplate(
    @Param('id') id: string,
  ): Promise<GenericResponseDto> {
    await this.emailsService.deleteEmailTemplate(id);
    return {
      status: HttpStatus.OK,
      message: 'Email template deleted successfully',
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('send')
  async sendEmail(
    @Body() emailData: SendEmailDto,
  ): Promise<GenericResponseDto> {
    // Extract the html content from the template ID
    const htmlTemplate = await this.emailsService.findOneEmailTemplate(
      emailData.templateId,
    );
    await this.emailsService.sendEmail(
      emailData.subject,
      htmlTemplate.templateContent,
      emailData.recipientEmails.map((email) => new Recipient(email)),
    );
    const sheetData: SheetDataDto = await this.sheetService.getSheetData();
    const sheetValues: ClientDto[] =
      this.clientService.getClientFromSheetValues(sheetData.values.slice(1));
    // Mark emails as sent in the respective status row for every client selected
    for (const email of emailData.recipientEmails) {
      const clientRowIdx = sheetValues.findIndex(
        (clientData) => clientData.email === email,
      );
      await this.sheetService.writeSheetRange({
        text: [[luxon.DateTime.now().toFormat('dd-MM-yyyy'), EmailStatus.SENT]],
        columnStartIdx: ClientSheetColumnsMap.LAST_EMAIL_SENT_DATE,
        columnEndIdx: ClientSheetColumnsMap.LAST_EMAIL_SENT_STATUS,
        rowStartIdx: clientRowIdx + 2, // sum 2, 1 to  match the spreadsheet indexing (starting from 1) and 1 from header);
        rowEndIdx: clientRowIdx + 2,
      });
    }
    return {
      status: HttpStatus.OK,
      message: 'Email sent successfully',
    };
  }
}
