import { IsInt, IsString, IsBoolean, IsDate, IsDateString } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  name: string;

  @IsDateString()
  start: Date

  
  @IsDateString()
  end: Date

  @IsInt()
  categoryId: number

  @IsInt()
  duration: number;

  @IsInt()
  userId: number;
}
