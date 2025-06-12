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
import { Recipient } from 'mailersend';
import { GenericResponseDto } from 'src/resources/common/dto/generic-response.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('emails')
export class EmailsController {
  constructor(private readonly emailsService: EmailsService) {}

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
    return {
      status: HttpStatus.OK,
      message: 'Email sent successfully',
    };
  }
}
