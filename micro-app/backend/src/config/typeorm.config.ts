import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const isDevelopment = this.configService.get<string>('NODE_ENV') === 'development';
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';

    return {
      type: 'mysql',
      host: this.configService.get<string>('DB_HOST'),
      port: this.configService.get<number>('DB_PORT'),
      username: this.configService.get<string>('DB_USERNAME'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_DATABASE'),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],

      // CRITICAL: Never auto-sync in production
      synchronize: false,

      // Optimized logging for production
      logging: isDevelopment ? true : ['error', 'warn'],
      logger: isDevelopment ? 'advanced-console' : 'simple-console',

      // Connection pool configuration for production performance
      extra: {
        // Connection pool settings
        connectionLimit: isProduction
          ? parseInt(this.configService.get<string>('DB_POOL_SIZE') || '10', 10)
          : 5,

        // Wait for available connection (milliseconds)
        queueLimit: 0,

        // Connection timeout (milliseconds)
        connectTimeout: 60000,

        // Keep alive initial delay (milliseconds)
        keepAliveInitialDelay: 10000,

        // Enable keep alive
        enableKeepAlive: true,

        // Multiple statements (security: false by default)
        multipleStatements: false,

        // SSL configuration for Azure/production
        ...(isProduction && this.configService.get<string>('DB_SSL') === 'true' ? {
          ssl: {
            rejectUnauthorized: this.configService.get<string>('DB_SSL_REJECT_UNAUTHORIZED') !== 'false',
          },
        } : {}),
      },

      // Retry connection on failure
      retryAttempts: isProduction ? 3 : 1,
      retryDelay: 3000,

      // Automatically load entities
      autoLoadEntities: false,

      // Drop schema on connection (NEVER in production)
      dropSchema: false,

      // Cache queries for better performance
      cache: isProduction ? {
        type: 'database',
        duration: 30000, // 30 seconds
      } : false,
    };
  }
}

// DataSource configuration for CLI (migrations, seeds)
export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_DATABASE || 'micro_app',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],

  // CRITICAL: NEVER use synchronize in production
  synchronize: false,

  // Migration settings
  migrationsTableName: 'migrations',
  migrationsRun: false, // Don't run migrations automatically

  // Logging for CLI operations
  logging: process.env.NODE_ENV === 'development' ? true : ['error', 'warn', 'migration'],

  // SSL for production (Azure, AWS RDS, etc.)
  extra: process.env.DB_SSL === 'true' ? {
    ssl: {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
    },
  } : {},
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
