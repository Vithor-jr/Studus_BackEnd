import { Controller, Post, Body, UseGuards, Param, Get, Delete, Patch, Put} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateCategoryDto } from '../dto/create-category-dto';
import { ActivityUpdateDto } from '../dto/activity-update.dto';
import { CategorieService } from '../categories/categories.service';
import { UpdateCategoryDto } from '../dto/update-category-dto';

@Controller('activities')
export class ActivityController {
  constructor(
    private readonly activityService: ActivityService,
    private readonly categorieService: CategorieService
  ) {}

	@UseGuards(JwtAuthGuard)
  @Post('create-activity')
  async createActivity(@Body() activityData: any) {
    const userId = activityData.userId;
    return this.activityService.createActivity(userId, activityData);
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-category')
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categorieService.createCategory(createCategoryDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('categories/:id')
  async updateCategory(@Param('id') categoryId: number, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categorieService.updateCategory(categoryId, updateCategoryDto.name, updateCategoryDto.color);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('categories/:id')
  async deleteCategory(@Param('id') categoryId: number) {
    return this.categorieService.deleteCategory(categoryId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('categories/:userId')
  async getCategoriesByUser(@Param('userId') userId: number) {
    return this.activityService.getCategoriesByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId/today')
  async getAtividadesHoje(@Param('userId') userId: number) {
    return this.activityService.getAtivitysToday(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId/atribuidas')
  async getAtividadesAtribuidas(@Param('userId') userId: number) {
    return this.activityService.getActivitiesAtribuidas(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId/not-completed-today')
  async getAtividadesNotCompletedToday(@Param('userId') userId: number) {
    return this.activityService.getAtivitysNotCompletedToday(userId);
  }


  @UseGuards(JwtAuthGuard)
  @Get(':userId/completed-today')
  async getCompletedActivitiesCountToday(@Param('userId') userId: number): Promise<any[]> {
    return this.activityService.getCompletedActivitiesToday(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId/week')
  async getActivitiesWeek(@Param('userId') userId: number) {
    return this.activityService.getActivitiesWeek(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId/next-week')
  async getActivitiesNextWeek(@Param('userId') userId: number) {
    return this.activityService.getActivitiesNextWeek(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId/not-next-week')
  async getActivitiesNotNextWeek(@Param('userId') userId: number) {
    return this.activityService.getActivitiesNotNextWeek(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId/not-completed-week')
  async getActivitiesNotCompletedWeek(@Param('userId') userId: number) {
    return this.activityService.getActivitiesNotCompletedThisWeek(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId/not-completed-last-week')
  async getActivitiesNotCompletedLastWeek(@Param('userId') userId: number) {
    return this.activityService.getActivitiesNotCompletedLastWeek(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId/not-completed-before-last-week')
  async getActivitiesNotCompletedBeforeLastWeek(@Param('userId') userId: number) {
    return this.activityService.getActivitiesNotBeforeLastWeek(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId/completed-week')
  async getActivitiesCompletedWeek(@Param('userId') userId: number) {
    return this.activityService.getActivitiesCompletedThisWeek(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId/completed-last-week')
  async getActivitiesCompletedLastWeek(@Param('userId') userId: number) {
    return this.activityService.getActivitiesCompletedLastWeek(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId/completed-before-last-week')
  async getActivitiesCompletedBeforeLastWeek(@Param('userId') userId: number) {
    return this.activityService.getActivitiesBeforeLastWeek(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId/completed-early')
  async getActivitiesCompletedEarly(@Param('userId') userId: number) {
    return this.activityService.getActivitiesCompletedEarly(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':userId/delete-activity')
  async deleteActivity(@Param('userId') userId:number, @Body('activityId') actvityId:number){
    return this.activityService.deleteActivity(userId, actvityId)
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':userId/complete')
  async completeActivity(@Param('userId') userId: number, @Body('activityId') activityId:number) {
    return this.activityService.completeActivity(userId, activityId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':userId/patch-important-activity')
  async importantActivity(@Param('userId') userId: number, @Body('activityId') activityId:number) {
    return this.activityService.putImportantActivity(userId, activityId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId/get-activitys-important')
  async getActivitysImportants(@Param('userId') userId: number){
    return this.activityService.getActivitysImportants(userId)
  }

  @UseGuards(JwtAuthGuard)
  @Get(':activityId/get-activitys-by-id')
  async getActivityById(@Param('activityId') activityId: number){
    return this.activityService.getActivitiesById(activityId)
  }

  @Patch(':activityId/update-activity')
  async updateActivity( @Param('activityId') id: number, @Body() activityUpdateDto: Partial<ActivityUpdateDto>) {
    return this.activityService.updateActivity(id, activityUpdateDto);
  }

}