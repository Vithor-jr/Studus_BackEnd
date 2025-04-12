import { Mood } from "@prisma/client";
import { IsInt, IsString } from "class-validator";

export class CreateMoodDto {
	@IsInt()
	userId:number

	@IsString()
	modd:Mood
}