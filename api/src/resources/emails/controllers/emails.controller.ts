import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { EmailsService } from '../services/emails.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { EmailTemplateDto } from '../dto/email-template.dto';

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
}
