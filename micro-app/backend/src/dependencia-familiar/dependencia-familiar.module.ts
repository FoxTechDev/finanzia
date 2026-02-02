import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DependenciaFamiliar } from './entities/dependencia-familiar.entity';
import { DependenciaFamiliarService } from './dependencia-familiar.service';
import { DependenciaFamiliarController } from './dependencia-familiar.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DependenciaFamiliar])],
  controllers: [DependenciaFamiliarController],
  providers: [DependenciaFamiliarService],
  exports: [DependenciaFamiliarService],
})
export class DependenciaFamiliarModule {}
