import { IsString, IsBoolean, IsInt } from "class-validator";

export class UpdateEditalDto {
	@IsBoolean()
	checked: boolean

	@IsInt()
	topicId:number

	@IsInt()
	userId:number
}