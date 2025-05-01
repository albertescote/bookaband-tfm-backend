import { Injectable } from "@nestjs/common";
import { Redis } from "ioredis";
import RedisService from "../../shared/infrastructure/redis/redis.service";
import SessionId from "../domain/sessionId";
import { ResetPasswordSession } from "../domain/resetPasswordSession";

@Injectable()
export class ResetPasswordRepository {
  redis: Redis;

  constructor(redisService: RedisService) {
    this.redis = redisService.getClient();
  }

  async delete(key: SessionId): Promise<void> {
    await this.redis.del(this.addLocalPrefix(key));
  }

  async getByKey(key: SessionId): Promise<ResetPasswordSession> {
    const cachedValue = await this.redis.get(this.addLocalPrefix(key));
    if (!cachedValue) {
      return undefined;
    }
    return ResetPasswordSession.fromPrimitives(JSON.parse(cachedValue));
  }

  async save(resetPassword: ResetPasswordSession): Promise<void> {
    const cacheValue = JSON.stringify(resetPassword.toPrimitives());
    await this.redis.set(
      this.addLocalPrefix(resetPassword.getSessionId()),
      cacheValue,
      "EX",
      300,
    );
  }

  private addLocalPrefix(sessionId: SessionId): string {
    return "reset-password:" + sessionId.toString();
  }
}
