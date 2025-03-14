import { PasswordService } from "../../../src/context/shared/utils/password.service";

describe("PasswordService should", () => {
  const passwordService = new PasswordService();

  it("hash a password using salt", async () => {
    const hashedPassword = await passwordService.hashPassword("securepassword");

    expect(hashedPassword).toStrictEqual(
      "$2b$10$Lo0tyfnzvAQuBLG5lAzzLOvAEXifKKk28bWVx6fzKEu8zDXqSOHhC",
    );
  });
});
