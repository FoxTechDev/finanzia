const fs = require('fs');
const path = require('path');

// Función para convertir kebab-case a PascalCase
function toPascalCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

// Función para convertir kebab-case a camelCase
function toCamelCase(str) {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

// Configuración de catálogos
// NOTA: 'categoria-ncb022' se excluye porque ya existe como 'clasificacion_prestamo'
// NOTA: 'estado-garantia' ya fue creado manualmente como ejemplo
const catalogos = [
  'recomendacion-asesor',
  'tipo-decision-comite',
  'tipo-pago',
  'estado-pago',
  'sexo',
  'estado-solicitud',
  'destino-credito',
  'estado-cuota',
  'tipo-interes',
  'periodicidad-pago',
  'tipo-calculo'
];

const basePath = path.join(__dirname, 'src', 'catalogos');

catalogos.forEach(catalogo => {
  const className = toPascalCase(catalogo);
  const camelName = toCamelCase(catalogo);
  const tableName = catalogo.replace(/-/g, '_');

  // Crear carpetas
  const catalogoPath = path.join(basePath, catalogo);
  const entitiesPath = path.join(catalogoPath, 'entities');
  const dtoPath = path.join(catalogoPath, 'dto');

  if (!fs.existsSync(entitiesPath)) {
    fs.mkdirSync(entitiesPath, { recursive: true });
  }
  if (!fs.existsSync(dtoPath)) {
    fs.mkdirSync(dtoPath, { recursive: true });
  }

  // Generar Entity
  const entityContent = `import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Catálogo de ${className}
 */
@Entity('${tableName}')
export class ${className} {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, unique: true })
  codigo: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ default: true })
  activo: boolean;

  @Column({ nullable: true })
  orden: number;

  @Column({ length: 7, nullable: true })
  color: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
`;

  fs.writeFileSync(path.join(entitiesPath, `${catalogo}.entity.ts`), entityContent);

  // Generar Create DTO
  const createDtoContent = `import { IsString, IsBoolean, IsOptional, IsNumber, MaxLength } from 'class-validator';

export class Create${className}Dto {
  @IsString()
  @MaxLength(20)
  codigo: string;

  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsNumber()
  orden?: number;

  @IsOptional()
  @IsString()
  @MaxLength(7)
  color?: string;
}
`;

  fs.writeFileSync(path.join(dtoPath, `create-${catalogo}.dto.ts`), createDtoContent);

  // Generar Update DTO
  const updateDtoContent = `import { PartialType } from '@nestjs/mapped-types';
import { Create${className}Dto } from './create-${catalogo}.dto';

export class Update${className}Dto extends PartialType(Create${className}Dto) {}
`;

  fs.writeFileSync(path.join(dtoPath, `update-${catalogo}.dto.ts`), updateDtoContent);

  // Generar Service
  const serviceContent = `import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ${className} } from './entities/${catalogo}.entity';
import { Create${className}Dto } from './dto/create-${catalogo}.dto';
import { Update${className}Dto } from './dto/update-${catalogo}.dto';

@Injectable()
export class ${className}Service {
  constructor(
    @InjectRepository(${className})
    private readonly ${camelName}Repository: Repository<${className}>,
  ) {}

  async create(create${className}Dto: Create${className}Dto): Promise<${className}> {
    const exists = await this.${camelName}Repository.findOne({
      where: { codigo: create${className}Dto.codigo },
    });

    if (exists) {
      throw new ConflictException(\`El código \${create${className}Dto.codigo} ya existe\`);
    }

    const ${camelName} = this.${camelName}Repository.create(create${className}Dto);
    return await this.${camelName}Repository.save(${camelName});
  }

  async findAll(): Promise<${className}[]> {
    return await this.${camelName}Repository.find({
      order: { orden: 'ASC', nombre: 'ASC' },
    });
  }

  async findActivos(): Promise<${className}[]> {
    return await this.${camelName}Repository.find({
      where: { activo: true },
      order: { orden: 'ASC', nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<${className}> {
    const ${camelName} = await this.${camelName}Repository.findOne({
      where: { id },
    });

    if (!${camelName}) {
      throw new NotFoundException(\`${className} con ID \${id} no encontrado\`);
    }

    return ${camelName};
  }

  async findByCodigo(codigo: string): Promise<${className}> {
    const ${camelName} = await this.${camelName}Repository.findOne({
      where: { codigo },
    });

    if (!${camelName}) {
      throw new NotFoundException(\`${className} con código \${codigo} no encontrado\`);
    }

    return ${camelName};
  }

  async update(id: number, update${className}Dto: Update${className}Dto): Promise<${className}> {
    const ${camelName} = await this.findOne(id);

    if (update${className}Dto.codigo && update${className}Dto.codigo !== ${camelName}.codigo) {
      const exists = await this.${camelName}Repository.findOne({
        where: { codigo: update${className}Dto.codigo },
      });

      if (exists) {
        throw new ConflictException(\`El código \${update${className}Dto.codigo} ya existe\`);
      }
    }

    Object.assign(${camelName}, update${className}Dto);
    return await this.${camelName}Repository.save(${camelName});
  }

  async remove(id: number): Promise<void> {
    const ${camelName} = await this.findOne(id);
    await this.${camelName}Repository.remove(${camelName});
  }
}
`;

  fs.writeFileSync(path.join(catalogoPath, `${catalogo}.service.ts`), serviceContent);

  // Generar Controller
  const controllerContent = `import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ${className}Service } from './${catalogo}.service';
import { Create${className}Dto } from './dto/create-${catalogo}.dto';
import { Update${className}Dto } from './dto/update-${catalogo}.dto';

@Controller('catalogos/${catalogo}')
export class ${className}Controller {
  constructor(private readonly ${camelName}Service: ${className}Service) {}

  @Post()
  create(@Body() create${className}Dto: Create${className}Dto) {
    return this.${camelName}Service.create(create${className}Dto);
  }

  @Get()
  findAll() {
    return this.${camelName}Service.findAll();
  }

  @Get('activos')
  findActivos() {
    return this.${camelName}Service.findActivos();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.${camelName}Service.findOne(id);
  }

  @Get('codigo/:codigo')
  findByCodigo(@Param('codigo') codigo: string) {
    return this.${camelName}Service.findByCodigo(codigo);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() update${className}Dto: Update${className}Dto,
  ) {
    return this.${camelName}Service.update(id, update${className}Dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.${camelName}Service.remove(id);
  }
}
`;

  fs.writeFileSync(path.join(catalogoPath, `${catalogo}.controller.ts`), controllerContent);

  // Generar Module
  const moduleContent = `import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ${className}Service } from './${catalogo}.service';
import { ${className}Controller } from './${catalogo}.controller';
import { ${className} } from './entities/${catalogo}.entity';

@Module({
  imports: [TypeOrmModule.forFeature([${className}])],
  controllers: [${className}Controller],
  providers: [${className}Service],
  exports: [${className}Service],
})
export class ${className}Module {}
`;

  fs.writeFileSync(path.join(catalogoPath, `${catalogo}.module.ts`), moduleContent);

  console.log(`✅ Catálogo ${catalogo} generado correctamente`);
});

console.log('\n✅ Todos los catálogos han sido generados exitosamente!');
