import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { EditalService } from './edital.service';
import { CreateEditalDto } from './dto/create-edital-dto';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';

@Controller('edital')
export class EditalController {
	constructor(private editalService: EditalService) {}

	@IsPublic()
  @Get()
  async getAllTopics() {
    return this.editalService.getAllTopics();
  }

	@IsPublic()
  @Get('progress/:userId')
  async getUserProgress(@Param('userId') userId: number) {
    return this.editalService.getUserProgress(userId);
  }

	@Post()
	async createTopic(@Body() createTopicDto: CreateEditalDto) {
		return this.editalService.createTopic(createTopicDto);
	}

	@Delete(':topicId/delete')
	async deleteTopic(@Param('topicId') topicId:number){
		return this.editalService.delete(topicId)
	}

	@Delete(':topicId/delete')
	async deleteTopicProgress(@Param('topicId') topicId:number){
		return this.editalService.delete(topicId)
	}

	@IsPublic()
	@Get('all-with-progress/:userId')
  async getAllTopicsWithProgress(@Param('userId') userId: number) {
    return this.editalService.getAllTopicsWithProgress(userId);
  }

	@IsPublic()
  @Put('progress/:userId/:topicId')
  async updateUserProgress(@Param('userId') userId: number, @Param('topicId') topicId: number, @Body('checked') checked: boolean,
  ) {
    return this.editalService.updateUserProgress(userId, topicId, checked);
  }
	
}
