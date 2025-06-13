import { Test, TestingModule } from "@nestjs/testing";
import { HealthcheckController } from "../../../../src/app/api/healthcheck/healthcheck.controller";

describe("HealthcheckController", () => {
  let controller: HealthcheckController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthcheckController],
    }).compile();

    controller = module.get<HealthcheckController>(HealthcheckController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should return void and have 200 status code", () => {
      const result = controller.create();
      expect(result).toBeUndefined();
    });
  });
});
