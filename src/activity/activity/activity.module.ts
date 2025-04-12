import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { CategorieService } from '../categories/categories.service';

@Module({
  imports: [PrismaModule],
  controllers: [ActivityController],
  providers: [ActivityService, CategorieService],
  exports: [ActivityService, CategorieService],
})
export class ActivityModule {}
