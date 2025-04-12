import { Body, Controller, Post, Get, Param, UseGuards, Request, UseInterceptors, UploadedFile, Put, Req, UnauthorizedException} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { ActivityService } from 'src/activity/activity/activity.service';
import { AuthService } from 'src/auth/auth.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly activityService: ActivityService
  ) {}

  @IsPublic()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('dados')
  obterDadosUsuario(@Request() req) {
    try {
      const usuarioAutenticado = req.user;
      
      return {
        id: usuarioAutenticado.id,
        name: usuarioAutenticado.name,
        email: usuarioAutenticado.email,
        phone: usuarioAutenticado.phone,
        username: usuarioAutenticado.username
      };
    } catch (error) {
      console.log('Erro ao obter dados do usuário:', error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload-photo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePhoto(@UploadedFile() file, @Body('userId') userId: number) {
    const photoUrl = await this.userService.uploadImage(file);
    return this.userService.updateUserPhoto(userId, photoUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/photo-url')
  async getProfilePhotoUrl(@Param('id') userId: number): Promise <{ photoUrl: string}> {
    try {
      const { photoUrl } = await this.userService.getUserPhotoUrl(userId);
      return { photoUrl: photoUrl };
    } catch (error) {
      return error
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/update-user')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/activities')
  async getActivities(@Param('id') userId: number) {
    return this.activityService.getActivitiesByUser(userId);
  }
}
