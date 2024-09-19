import { UserRepository } from "../../../../src/context/user/infrastructure/user.repository";
import User from "../../../../src/context/shared/domain/user";
import UserId from "../../../../src/context/shared/domain/userId";
import { Role } from "../../../../src/context/shared/domain/role";
import PrismaService from "../../../../src/context/shared/infrastructure/db/prisma.service";

describe("User Repository should", () => {
  const prismaService = new PrismaService();
  const userRepository = new UserRepository(prismaService);

  const userId = UserId.generate();

  afterAll(async () => {
    await prismaService.onModuleDestroy();
  });

  it("CRUD for user object", async () => {
    const newUser: User = new User(
      userId,
      "John",
      "Doe",
      "email@example.com",
      "1234",
      Role.Musician,
    );

    const addedUser = await userRepository.addUser(newUser);

    expect(addedUser).toStrictEqual(newUser);
    let allUsers = await userRepository.getAllUsers();
    expect(allUsers.length).toStrictEqual(1);
    expect(allUsers[0]).toStrictEqual(newUser);

    const newUpdatedUser = new User(
      userId,
      "John",
      "Doe",
      "email@example.com",
      "1234",
      Role.Client,
    );
    const updatedUser = await userRepository.updateUser(
      new UserId(addedUser.toPrimitives().id),
      newUpdatedUser,
    );

    expect(updatedUser).toStrictEqual(newUpdatedUser);
    const storedUser = await userRepository.getUserById(
      new UserId(newUpdatedUser.toPrimitives().id),
    );
    expect(storedUser).toStrictEqual(newUpdatedUser);

    const deleted = await userRepository.deleteUser(
      new UserId(updatedUser.toPrimitives().id),
    );
    expect(deleted).toBeTruthy();

    allUsers = await userRepository.getAllUsers();
    expect(allUsers.length).toStrictEqual(0);
  });
});
