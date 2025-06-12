import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsString, IsUUID } from 'class-validator';

export class SendEmailDto {
  @IsString()
  @ApiProperty()
  subject: string;

  @IsUUID()
  @ApiProperty()
  templateId: string;

  @IsArray()
  @IsEmail({}, { each: true })
  @ApiProperty()
  recipientEmails: string[];
}
