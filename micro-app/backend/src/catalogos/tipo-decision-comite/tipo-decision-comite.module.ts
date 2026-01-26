import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoDecisionComiteService } from './tipo-decision-comite.service';
import { TipoDecisionComiteController } from './tipo-decision-comite.controller';
import { TipoDecisionComite } from './entities/tipo-decision-comite.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TipoDecisionComite])],
  controllers: [TipoDecisionComiteController],
  providers: [TipoDecisionComiteService],
  exports: [TipoDecisionComiteService],
})
export class TipoDecisionComiteModule {}
