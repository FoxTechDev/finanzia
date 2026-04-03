import { Controller, Get, HttpCode } from '@nestjs/common';
// import { SkipThrottle } from '@nestjs/throttler';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  environment: string;
  database: {
    connected: boolean;
    responseTime?: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
}

@Controller()
export class HealthController {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  /**
   * Health check principal - usado por Digital Ocean App Platform
   * Siempre devuelve 200 si la app está corriendo (sin depender de BD)
   */
  @Get('health')
  @HttpCode(200)
  healthCheck(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Health check detallado con estado de BD y memoria
   */
  @Get('health/detail')
  async detailedCheck(): Promise<HealthStatus> {
    const startTime = Date.now();
    let dbConnected = false;
    let dbResponseTime: number | undefined;

    try {
      await this.dataSource.query('SELECT 1');
      dbConnected = true;
      dbResponseTime = Date.now() - startTime;
    } catch (error) {
      dbConnected = false;
    }

    const memUsage = process.memoryUsage();
    const totalMemory = memUsage.heapTotal;
    const usedMemory = memUsage.heapUsed;
    const memoryPercentage = (usedMemory / totalMemory) * 100;

    return {
      status: dbConnected ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        connected: dbConnected,
        responseTime: dbResponseTime,
      },
      memory: {
        used: Math.round(usedMemory / 1024 / 1024),
        total: Math.round(totalMemory / 1024 / 1024),
        percentage: Math.round(memoryPercentage),
      },
    };
  }

  @Get('health/ping')
  ping(): { message: string; timestamp: string } {
    return {
      message: 'pong',
      timestamp: new Date().toISOString(),
    };
  }
}
