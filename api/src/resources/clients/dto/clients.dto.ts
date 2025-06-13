import { DateTime } from 'luxon';
import { EmailStatus } from '../../emails/enum/email-status.enum';

export class ClientDto {
  id: string;
  name: string;
  email: string;
  lastEmailSentDate?: DateTime;
  lastEmailSentStatus?: EmailStatus;
}
