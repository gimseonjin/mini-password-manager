import { Controller, Get } from '@nestjs/common';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  HealthIndicatorService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { DatabaseAdapter } from '@app/core/database/database.adapter';

@Controller('health')
export class ApiController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly databaseAdapter: DatabaseAdapter,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    return this.health.check([
      () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
      () =>
        this.disk.checkStorage('disk health', {
          thresholdPercent: 0.8,
          path: '/',
        }),
      () => this.memory.checkHeap('memory_heap', 512 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 512 * 1024 * 1024),
      () => this.isHealthyDatabase(),
    ]);
  }

  async isHealthyDatabase() {
    const indicator = this.healthIndicatorService.check('database');
    this.healthIndicatorService;
    try {
      await this.databaseAdapter.$queryRaw`SELECT 1`;
      return indicator.up();
    } catch (err) {
      return indicator.down({ error: err?.message });
    }
  }
}
