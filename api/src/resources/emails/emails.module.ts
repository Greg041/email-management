import { Module } from '@nestjs/common';
import { EmailsService } from './services/emails.service';
import { EmailsController } from './controllers/emails.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailTemplate } from './entities/email-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmailTemplate])],
  controllers: [EmailsController],
  providers: [EmailsService],
})
export class EmailsModule {}
