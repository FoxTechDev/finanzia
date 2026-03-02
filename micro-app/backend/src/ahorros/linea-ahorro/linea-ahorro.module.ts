import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LineaAhorro } from './entities/linea-ahorro.entity';
import { LineaAhorroService } from './linea-ahorro.service';
import { LineaAhorroController } from './linea-ahorro.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LineaAhorro])],
  controllers: [LineaAhorroController],
  providers: [LineaAhorroService],
  exports: [LineaAhorroService],
})
export class LineaAhorroModule {}
