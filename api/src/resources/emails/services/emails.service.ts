import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as DOMPurify from 'isomorphic-dompurify';
import { EmailTemplate } from '../entities/email-template.entity';
import { Repository } from 'typeorm';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import { ConfigService } from '@nestjs/config';
import { EmailVariablesAllowed } from '../interfaces/email-variables';

@Injectable()
export class EmailsService {
  private mailerSend = new MailerSend({
    apiKey: this.configService.get<string>('MAILERSEND_API_KEY'),
  });

  constructor(
    @InjectRepository(EmailTemplate)
    private readonly emailTemplateRepo: Repository<EmailTemplate>,
    private readonly configService: ConfigService,
  ) {}

  async replaceTemplateVariables(
    templateContent: string,
    variables: EmailVariablesAllowed,
  ): Promise<string> {
    // Every word in the template content that matches the basic variable pattern {{variableName}}
    const variableRegex = /\{\{(\w+)\}\}/g;
    return templateContent.replace(variableRegex, (match, variableName) => {
      // Check if the variable and its value exists in the provided variables object
      if (variables.hasOwnProperty(variableName)) {
        return variables[variableName];
      } else {
        // If the variable is not found, return the original match
        return match;
      }
    });
  }

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

  async findOneEmailTemplate(id: string): Promise<EmailTemplate> {
    const template = await this.emailTemplateRepo.findOne({
      where: { id },
    });
    if (!template) {
      throw new NotFoundException('Email template not found');
    }
    return template;
  }

  async deleteEmailTemplate(id: string): Promise<void> {
    const template = await this.findOneEmailTemplate(id);
    this.emailTemplateRepo.remove(template);
  }

  async sendEmail(
    subject: string,
    htmlContent: string,
    recipientEmails: Recipient[],
  ) {
    const emailParams = await Promise.all(
      recipientEmails.map(async (recipient) => {
        const html = await this.replaceTemplateVariables(htmlContent, {
          clientEmail: recipient.email,
          clientName: recipient.name,
        });
        return new EmailParams()
          .setFrom(
            new Sender(
              this.configService.getOrThrow<string>('MAILERSEND_FROM_EMAIL'),
            ),
          )
          .setTo([recipient])
          .setSubject(subject)
          .setHtml(html);
      }),
    );
    await this.mailerSend.email.sendBulk(emailParams);
  }
}
