import { BadGatewayException, Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from '../dto/create-category-dto';
import { UpdateCategoryDto } from '../dto/update-category-dto';

@Injectable()
export class CategorieService {
  constructor(private prisma: PrismaService) {}

	async createCategory(data: CreateCategoryDto) {
		const newData = { ...data };
		
		if (newData.isDefault) {
			newData.userId = 2;
		}
		return this.prisma.category.create({
			data: newData,
		});
	}

	async deleteCategory(categoryId: number): Promise<void> {
		try {
			const existingCategory = await this.prisma.category.findUnique({
				where: { id: categoryId },
			});
		
			if (!existingCategory) {
				throw new BadRequestException(`Categoria com ID ${categoryId} não encontrada.`);
				
			}

			if (existingCategory.isDefault) {
				throw new BadRequestException('Não é possível excluir uma categoria padrão.');
			}

			const sessionsToDelete = await this.prisma.studySession.findMany({
				where: {
					categoryId: categoryId,
				},
			});

			const activitiesToDelete = await this.prisma.activity.findMany({
				where:{
					categoryId: categoryId
				}
			})

			for (const session of sessionsToDelete) {
				await this.prisma.studySession.delete({
					where: { id: session.id },
				});
			}

			for (const activity of activitiesToDelete) {
				await this.prisma.activity.delete({
					where: { id: activity.id },
				});
			}			

			await this.prisma.category.delete({
				where: { id: categoryId },
			});
		} catch(error) {
			console.error('Erro ao atualizar categoria:', error.message);
			throw new BadRequestException('Ocorreu um erro ao atualizar a categoria.');
		}
	}
	
	
	async updateCategory(categoryId: number, name: string, color: string) {
		try {

			const existingCategory = await this.prisma.category.findUnique({
				where: { id: categoryId },
			});
		
			if (!existingCategory) {
				throw new Error(`Categoria com ID ${categoryId} não encontrada.`);
			}

			return await this.prisma.category.update({
				where: { id: categoryId },
				data: {
					name: name,
					color:color
				},
			});
		} catch (error) {
			console.error('Erro ao atualizar categoria:', error.message);
			throw new Error('Ocorreu um erro ao atualizar a categoria.');
		}
	}	
	
	
}