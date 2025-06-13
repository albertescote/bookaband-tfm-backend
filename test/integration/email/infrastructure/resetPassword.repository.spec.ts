import { Test, TestingModule } from "@nestjs/testing";
import { ResetPasswordRepository } from "../../../../src/context/email/infrastructure/resetPassword.repository";
import { ResetPasswordSession } from "../../../../src/context/email/domain/resetPasswordSession";
import SessionId from "../../../../src/context/email/domain/sessionId";
import UserId from "../../../../src/context/shared/domain/userId";
import { Languages } from "../../../../src/context/shared/domain/languages";
import RedisService from "../../../../src/context/shared/infrastructure/redis/redis.service";
import { REDIS } from "../../../../src/config";

describe("ResetPasswordRepository Integration Tests", () => {
  let repository: ResetPasswordRepository;
  let redisService: RedisService;
  let testSession: ResetPasswordSession;
  let testSessionId: SessionId;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResetPasswordRepository,
        RedisService,
        {
          provide: "RedisConfig",
          useFactory: () => {
            return {
              prefix: "test-reset-password:",
              port: REDIS.PORT,
              url: REDIS.URL,
            };
          },
        },
      ],
    }).compile();

    repository = module.get<ResetPasswordRepository>(ResetPasswordRepository);
    redisService = module.get<RedisService>(RedisService);

    testSession = ResetPasswordSession.create(
      UserId.generate(),
      Languages.ENGLISH,
    );
    testSessionId = testSession.getSessionId();
  });

  afterAll(async () => {
    await repository.delete(testSessionId);
    await redisService.onModuleDestroy();
  });

  beforeEach(async () => {
    await repository.delete(testSessionId);
  });

  describe("save", () => {
    it("should save a reset password session", async () => {
      await repository.save(testSession);

      const savedSession = await repository.getByKey(testSessionId);
      expect(savedSession).toBeDefined();
      expect(savedSession.toPrimitives()).toEqual(testSession.toPrimitives());
    });
  });

  describe("getByKey", () => {
    it("should return undefined when session does not exist", async () => {
      const nonExistentId = SessionId.generate();
      const foundSession = await repository.getByKey(nonExistentId);

      expect(foundSession).toBeUndefined();
    });

    it("should return the session when it exists", async () => {
      await repository.save(testSession);

      const foundSession = await repository.getByKey(testSessionId);
      expect(foundSession).toBeDefined();
      expect(foundSession.toPrimitives()).toEqual(testSession.toPrimitives());
    });
  });

  describe("delete", () => {
    it("should delete an existing session", async () => {
      await repository.save(testSession);
      await repository.delete(testSessionId);

      const foundSession = await repository.getByKey(testSessionId);
      expect(foundSession).toBeUndefined();
    });

    it("should not throw error when deleting non-existent session", async () => {
      const nonExistentId = SessionId.generate();
      await expect(repository.delete(nonExistentId)).resolves.not.toThrow();
    });
  });
});
