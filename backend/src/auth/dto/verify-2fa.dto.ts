import { IsNotEmpty, Length } from 'class-validator';

export class Verify2FaDto {
  @IsNotEmpty()
  @Length(6, 6)
  token: string;
}
