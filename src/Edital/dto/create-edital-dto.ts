import { IsBoolean, IsString } from "class-validator";

export class CreateEditalDto {
	@IsString()
	name: string

	@IsString()
	vestibular: string

	@IsString()
	discipline: string

	@IsBoolean()
	important: boolean
}