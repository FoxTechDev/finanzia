import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoAhorro } from './entities/tipo-ahorro.entity';
import { TipoAhorroService } from './tipo-ahorro.service';
import { TipoAhorroController } from './tipo-ahorro.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TipoAhorro])],
  controllers: [TipoAhorroController],
  providers: [TipoAhorroService],
  exports: [TipoAhorroService],
})
export class TipoAhorroModule {}
