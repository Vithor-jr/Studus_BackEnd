import { IsString, IsBoolean, IsOptional, IsInt, ValidateIf } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  readonly name: string;

	@IsString()
  readonly color: string;

  @IsBoolean()
  @IsOptional()
  readonly isDefault: boolean;

  @IsInt()
  @ValidateIf(o => !o.isDefault)
  readonly userId: number;
}
