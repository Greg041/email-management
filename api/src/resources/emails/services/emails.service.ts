import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as DOMPurify from 'isomorphic-dompurify';
import { EmailTemplate } from '../entities/email-template.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EmailsService {
  constructor(
    @InjectRepository(EmailTemplate)
    private readonly emailTemplateRepo: Repository<EmailTemplate>,
  ) {}

  async saveEmailTemplate(
    templateName: string,
    templateContent: string,
  ): Promise<EmailTemplate> {
    const sanitizedContent = DOMPurify.sanitize(templateContent);
    const emailTemplate = this.emailTemplateRepo.create({
      templateName,
      templateContent: sanitizedContent,
    });
    return this.emailTemplateRepo.save(emailTemplate);
  }

  async findAllEmailTemplates(): Promise<EmailTemplate[]> {
    return this.emailTemplateRepo.find();
  }
}
