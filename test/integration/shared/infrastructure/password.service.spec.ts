import { Test, TestingModule } from "@nestjs/testing";
import { PasswordService } from "../../../../src/context/shared/infrastructure/password.service";

describe("PasswordService Integration Tests", () => {
  let service: PasswordService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  describe("isPasswordSecure", () => {
    it("should return true for a secure password", () => {
      const securePasswords = [
        "SecurePass123!",
        "ComplexP@ssw0rd",
        "Str0ng!Password",
        "P@ssw0rd123",
      ];

      securePasswords.forEach((password) => {
        expect(service.isPasswordSecure(password)).toBe(true);
      });
    });

    it("should return false for insecure passwords", () => {
      const insecurePasswords = [
        "weak",
        "password",
        "Password",
        "password123",
        "PASSWORD123!",
        "Pass123",
        "Pass!@#",
      ];

      insecurePasswords.forEach((password) => {
        expect(service.isPasswordSecure(password)).toBe(false);
      });
    });
  });

  describe("hashPassword", () => {
    it("should hash a password", async () => {
      const password = "SecurePass123!";
      const hashedPassword = await service.hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.startsWith("$2b$")).toBe(true);
    });

    it("should generate different hashes for the same password", async () => {
      const password = "SecurePass123!";
      const hash1 = await service.hashPassword(password);
      const hash2 = await service.hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("comparePasswords", () => {
    it("should return true when comparing a password with its hash", async () => {
      const password = "SecurePass123!";
      const hashedPassword = await service.hashPassword(password);

      const result = await service.comparePasswords(password, hashedPassword);
      expect(result).toBe(true);
    });

    it("should return false when comparing a password with a different hash", async () => {
      const password = "SecurePass123!";
      const wrongPassword = "WrongPass123!";
      const hashedPassword = await service.hashPassword(password);

      const result = await service.comparePasswords(
        wrongPassword,
        hashedPassword,
      );
      expect(result).toBe(false);
    });

    it("should return false when comparing with an invalid hash", async () => {
      const password = "SecurePass123!";
      const invalidHash = "invalid-hash";

      const result = await service.comparePasswords(password, invalidHash);
      expect(result).toBe(false);
    });
  });
});
