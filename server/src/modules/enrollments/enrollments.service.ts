import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { enrollments } from './enrollments.schema';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly service: DatabaseService) {}

  async create(createEnrollmentDto: CreateEnrollmentDto) {
    // Verifica se a matrícula já existe para evitar erro de duplicidade na chave composta
    const existing = await this.service.db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.studentRa, createEnrollmentDto.studentRa),
          eq(enrollments.courseId, createEnrollmentDto.courseId),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException('Este estudante já está matriculado neste curso.');
    }

    const [enrollment] = await this.service.db
      .insert(enrollments)
      .values({
        studentRa: createEnrollmentDto.studentRa,
        courseId: createEnrollmentDto.courseId,
      })
      .returning();

    return enrollment;
  }

  findAll() {
    return this.service.db
      .select()
      .from(enrollments);
  }

  async findOne(studentRa: number, courseId: number) {
    const [enrollment] = await this.service.db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.studentRa, studentRa),
          eq(enrollments.courseId, courseId),
        ),
      )
      .limit(1);

    if (!enrollment) {
      throw new NotFoundException(
        `Matrícula não encontrada para o estudante RA ${studentRa} no curso ID ${courseId}.`,
      );
    }

    return enrollment;
  }

  async remove(studentRa: number, courseId: number) {
    const deleted = await this.service.db
      .delete(enrollments)
      .where(
        and(
          eq(enrollments.studentRa, studentRa),
          eq(enrollments.courseId, courseId),
        ),
      )
      .returning({ 
        studentRa: enrollments.studentRa, 
        courseId: enrollments.courseId 
      });

    if (!deleted.length) {
      throw new NotFoundException(
        `Matrícula não encontrada para o estudante RA ${studentRa} no curso ID ${courseId}.`,
      );
    }

    return {
      message: 'Matrícula removida com sucesso.',
    };
  }
}
