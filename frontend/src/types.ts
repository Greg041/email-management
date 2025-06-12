import { EmailStatus, ResponseStatusType } from "./enums";

export interface ClientRaw {
  id: string;
  name: string;
  email: string;
  lastEmailSentDate?: string;
  lastEmailSentStatus?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  lastEmailSentDate?: Date | null;
  lastEmailSentStatus?: EmailStatus | null;
}

export interface EmailTemplateRaw {
  id: string;
  templateName: string;
  uploadedAt: string;
}

export interface EmailTemplate {
  id: string;
  templateName: string;
  uploadedAt: Date;
}

export interface EmailFormData {
  subject: string;
  templateId: string | null;
  recipientEmails?: string[];
}

export interface GenericResponse {
  status: number;
  message: string;
}

export interface ToastProps {
  message: string;
  type: ResponseStatusType;
}
