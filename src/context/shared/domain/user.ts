import UserId from "./userId";
import { Role } from "./role";
import { InvalidRoleException } from "../exceptions/invalidRoleException";

export interface UserPrimitives {
  id: string;
  firstName: string;
  familyName: string;
  email: string;
  password: string;
  role: string;
  emailVerified: boolean;
  imageUrl?: string;
}

export default class User {
  constructor(
    private id: UserId,
    private firstName: string,
    private familyName: string,
    private email: string,
    private password: string,
    private role: Role,
    private emailVerified: boolean = false,
    private imageUrl?: string,
  ) {}

  static fromPrimitives(user: UserPrimitives): User {
    const role = Role[user.role];
    if (!role) {
      throw new InvalidRoleException(user.role);
    }
    return new User(
      new UserId(user.id),
      user.firstName,
      user.familyName,
      user.email,
      user.password,
      role,
      user.emailVerified,
      user.imageUrl,
    );
  }

  toPrimitives(): UserPrimitives {
    return {
      id: this.id.toPrimitive(),
      firstName: this.firstName,
      familyName: this.familyName,
      email: this.email,
      password: this.password,
      role: this.role.toString(),
      emailVerified: this.emailVerified,
      imageUrl: this.imageUrl,
    };
  }

  getRole(): Role {
    return this.role;
  }

  getId(): UserId {
    return this.id;
  }

  verifyEmail(): void {
    this.emailVerified = true;
  }
}
