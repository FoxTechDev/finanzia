import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './config/typeorm.config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DepartamentoModule } from './departamento/departamento.module';
import { MunicipioModule } from './municipio/municipio.module';
import { DistritoModule } from './distrito/distrito.module';
import { PersonaModule } from './persona/persona.module';
import { CreditosModule } from './creditos/creditos.module';
import { CatalogosModule } from './catalogos/catalogos.module';
import { HealthModule } from './health/health.module';
import { DependenciaFamiliarModule } from './dependencia-familiar/dependencia-familiar.module';
import { TipoGastoModule } from './tipo-gasto/tipo-gasto.module';
import { TipoIngresoModule } from './tipo-ingreso/tipo-ingreso.module';
import { TipoViviendaModule } from './tipo-vivienda/tipo-vivienda.module';
import { GastoClienteModule } from './gasto-cliente/gasto-cliente.module';
import { IngresoClienteModule } from './ingreso-cliente/ingreso-cliente.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    HealthModule,
    UsersModule,
    AuthModule,
    DepartamentoModule,
    MunicipioModule,
    DistritoModule,
    PersonaModule,
    CreditosModule,
    CatalogosModule,
    DependenciaFamiliarModule,
    TipoGastoModule,
    TipoIngresoModule,
    TipoViviendaModule,
    GastoClienteModule,
    IngresoClienteModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
