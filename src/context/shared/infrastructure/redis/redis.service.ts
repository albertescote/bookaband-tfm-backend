import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { Redis } from "ioredis";

@Injectable()
export default class RedisService implements OnModuleInit, OnModuleDestroy {
  private redis?: Redis;

  constructor(
    @Inject("RedisConfig")
    private config: { prefix: string; port: string; url: string },
  ) {}
  onModuleInit() {
    this.initialize();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redis) {
      return this.redis.disconnect();
    }
    return new Promise((resolve) => resolve());
  }

  getClient(): Redis {
    if (!this.redis) {
      this.initialize();
    }
    return this.redis;
  }

  private initialize() {
    if (this.redis) return;

    this.redis = new Redis({
      port: Number(this.config.port),
      host: this.config.url,
      keyPrefix: this.config.prefix,
    });
  }
}
