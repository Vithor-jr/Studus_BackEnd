import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { SessionService } from "./sessions.service";
import { IsPublic } from "src/auth/decorators/is-public.decorator";
import { CreateSessionDto } from "./dto/create-session-dto";
import { UpdateSessionDto } from "./dto/update-session-dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";

@Controller('sessions')
export class SessionsController{
	constructor(private readonly sessionService : SessionService){}

	@UseGuards(JwtAuthGuard)
	@Post('create-session')
  async create(@Body() createStudySessionDto: CreateSessionDto) {
    return this.sessionService.createStudySession(createStudySessionDto);
	}

	@UseGuards(JwtAuthGuard)
	@Patch('update-session/:userId')
	async updateSession(@Param('userId') userId: number, @Body() updateSessionDto: UpdateSessionDto) {
		return this.sessionService.updateSession(userId, updateSessionDto);
	}

	@UseGuards(JwtAuthGuard)
	@Patch(':userId/:sessionId/complete-session')
	async completeSession(@Param('userId') userId: number, @Param('sessionId') sessionId: number) {
		return this.sessionService.completSession(userId, sessionId);
	}
	
	@UseGuards(JwtAuthGuard)
	@Delete(':userId/:sessionId/delete-session')
	async deleteSession(@Param('userId') userId :number,@Param('sessionId') sessionId:number){
		return this.sessionService.deleteSession(userId, sessionId);
	}

	@UseGuards(JwtAuthGuard)
	@Get(':userId/sessions-user')
	async getAllSessionByuser(@Param('userId') userId:number){
		return await this.sessionService.getSessionByUser(userId)
	}

	@UseGuards(JwtAuthGuard)
	@Get(':userId/sessions-user-today')
	async getSessionTodayByuser(@Param('userId') userId:number){
		return await this.sessionService.getSessionTodayByUser(userId)
	}

	@UseGuards(JwtAuthGuard)
	@Get(':sessionId/sessions-by-id')
	async getSessionById(@Param('sessionId') sessionId:number){
		return await this.sessionService.getSessionById(sessionId)
	}

	@UseGuards(JwtAuthGuard)
	@Get('sessions-week/:userId')
	async getWeeklyDuration(@Param('userId') userId: number) {
		return this.sessionService.getWeeklySessionDurations(userId);
	}
}