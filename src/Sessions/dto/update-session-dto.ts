import { IsInt, IsString } from "class-validator";

export class UpdateSessionDto {
	@IsString()
	name: string

	@IsInt()
	duration: number

	@IsInt()
	sessionId: number

	@IsInt()
	categoryId: number
}