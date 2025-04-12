import { IsInt, IsString, IsDateString } from 'class-validator';

export class ActivityUpdateDto {
  @IsString()
  name: string;

  @IsInt()
  categoryId: number;

  @IsDateString()
  dueDate: Date;
}