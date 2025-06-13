import { Role } from "../../../../src/context/shared/domain/role";
import { RoleAuth } from "../../../../src/context/shared/decorator/roleAuthorization.decorator";
import { UnauthorizedRoleException } from "../../../../src/context/shared/exceptions/unauthorizedRoleException";
import { InvalidRoleException } from "../../../../src/context/shared/exceptions/invalidRoleException";
import { UserAuthInfo } from "../../../../src/context/shared/domain/userAuthInfo";

describe("RoleAuth Decorator", () => {
  class TestClass {
    @RoleAuth([Role.Admin])
    async adminOnlyMethod(authInfo: UserAuthInfo) {
      return "admin access granted";
    }

    @RoleAuth([Role.Client, Role.Musician])
    async clientOrMusicianMethod(authInfo: UserAuthInfo) {
      return "client or musician access granted";
    }
  }

  let testInstance: TestClass;

  beforeEach(() => {
    testInstance = new TestClass();
  });

  describe("adminOnlyMethod", () => {
    it("should allow access when user has Admin role", async () => {
      const authInfo: UserAuthInfo = {
        id: "123",
        email: "admin@example.com",
        role: Role.Admin,
      };

      const result = await testInstance.adminOnlyMethod(authInfo);
      expect(result).toBe("admin access granted");
    });

    it("should throw UnauthorizedRoleException when user has non-Admin role", async () => {
      const authInfo: UserAuthInfo = {
        id: "123",
        email: "client@example.com",
        role: Role.Client,
      };

      await expect(async () => {
        await testInstance.adminOnlyMethod(authInfo);
      }).rejects.toThrow(UnauthorizedRoleException);
    });

    it("should throw InvalidRoleException when role is invalid", async () => {
      const authInfo: UserAuthInfo = {
        id: "123",
        email: "user@example.com",
        role: "InvalidRole" as Role,
      };

      await expect(async () => {
        await testInstance.adminOnlyMethod(authInfo);
      }).rejects.toThrow(InvalidRoleException);
    });
  });

  describe("clientOrMusicianMethod", () => {
    it("should allow access when user has Client role", async () => {
      const authInfo: UserAuthInfo = {
        id: "123",
        email: "client@example.com",
        role: Role.Client,
      };

      const result = await testInstance.clientOrMusicianMethod(authInfo);
      expect(result).toBe("client or musician access granted");
    });

    it("should allow access when user has Musician role", async () => {
      const authInfo: UserAuthInfo = {
        id: "123",
        email: "musician@example.com",
        role: Role.Musician,
      };

      const result = await testInstance.clientOrMusicianMethod(authInfo);
      expect(result).toBe("client or musician access granted");
    });

    it("should throw UnauthorizedRoleException when user has unauthorized role", async () => {
      const authInfo: UserAuthInfo = {
        id: "123",
        email: "admin@example.com",
        role: Role.Admin,
      };

      await expect(async () => {
        await testInstance.clientOrMusicianMethod(authInfo);
      }).rejects.toThrow(UnauthorizedRoleException);
    });

    it("should throw InvalidRoleException when role is invalid", async () => {
      const authInfo: UserAuthInfo = {
        id: "123",
        email: "user@example.com",
        role: "InvalidRole" as Role,
      };

      await expect(async () => {
        await testInstance.clientOrMusicianMethod(authInfo);
      }).rejects.toThrow(InvalidRoleException);
    });
  });
});
