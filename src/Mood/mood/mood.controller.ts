import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MoodService } from './mood.service';
import { PrismaClient } from '@prisma/client';
import { CreateMoodDto } from '../dto/create-mood-dto';

@Controller('mood')
export class MoodController {
	constructor(private  readonly moodService : MoodService){}


	@Post('set-mood')
	async create(@Body() createMoodDto: CreateMoodDto){
		return this.moodService.createDailyMood(createMoodDto.userId, createMoodDto.modd)
	}

	@Get(':userId/mood-week')
	async getModd(@Param('userId') userId : number){
		return this.moodService.getWeeklyMoods(userId)
	}
}
