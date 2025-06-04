import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class EmailTemplate {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  templateName: string;

  @Exclude()
  @ApiProperty()
  @Column()
  templateContent: string;

  @ApiProperty()
  @CreateDateColumn()
  uploadedAt: Date;
}
