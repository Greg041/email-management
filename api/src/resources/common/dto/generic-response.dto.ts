import { ApiProperty } from '@nestjs/swagger';

export class GenericResponseDto {
  @ApiProperty()
  status: number;

  @ApiProperty()
  message: string;
}
