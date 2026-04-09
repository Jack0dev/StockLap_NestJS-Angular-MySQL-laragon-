import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class AdminQueryOrdersDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  side?: string;

  @IsOptional()
  @IsNumberString()
  stockId?: string;
}
