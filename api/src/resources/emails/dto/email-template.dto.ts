import { OmitType } from '@nestjs/swagger';
import { EmailTemplate } from '../entities/email-template.entity';

export class EmailTemplateDto extends OmitType(EmailTemplate, [
  'templateContent',
] as const) {}
