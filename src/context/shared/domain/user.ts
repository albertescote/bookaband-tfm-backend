import UserId from "./userId";
import { Role } from "./role";
import { InvalidRoleException } from "../exceptions/invalidRoleException";

export interface UserPrimitives {
  id: string;
  firstName: string;
  familyName: string;
  email: string;
  role: string;
  emailVerified: boolean;
  joinedDate: string;
  phoneNumber?: string;
  nationalId?: string;
  password?: string;
  imageUrl?: string;
  bio?: string;
}

export default class User {
  constructor(
    private id: UserId,
    private firstName: string,
    private familyName: string,
    private email: string,
    private role: Role,
    private emailVerified: boolean = false,
    private joinedDate: Date,
    private phoneNumber?: string,
    private nationalId?: string,
    private password?: string,
    private imageUrl?: string,
    private bio?: string,
  ) {}

  static create(
    firstName: string,
    familyName: string,
    email: string,
    role: Role,
    encryptedPassword: string,
    imageUrl?: string,
    bio?: string,
  ) {
    return new User(
      UserId.generate(),
      firstName,
      familyName,
      email,
      role,
      false,
      new Date(),
      undefined,
      undefined,
      encryptedPassword,
      imageUrl,
      bio,
    );
  }

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
      role,
      user.emailVerified,
      new Date(user.joinedDate),
      user.phoneNumber ?? undefined,
      user.nationalId ?? undefined,
      user.password ?? undefined,
      user.imageUrl ?? undefined,
      user.bio ?? undefined,
    );
  }

  toPrimitives(): UserPrimitives {
    return {
      id: this.id.toPrimitive(),
      firstName: this.firstName,
      familyName: this.familyName,
      email: this.email,
      role: this.role.toString(),
      emailVerified: this.emailVerified,
      joinedDate: this.joinedDate.toISOString(),
      phoneNumber: this.phoneNumber,
      nationalId: this.nationalId,
      password: this.password,
      imageUrl: this.imageUrl,
      bio: this.bio,
    };
  }

  getRole(): Role {
    return this.role;
  }

  getId(): UserId {
    return this.id;
  }

  isEmailVerified(): boolean {
    return this.emailVerified;
  }

  resetPassword(newPassword: string): void {
    this.password = newPassword;
  }

  hasPassword(): boolean {
    return !!this.password;
  }

  getFullName(): string {
    return this.firstName + " " + this.familyName;
  }

  getNationalId(): string {
    return this.nationalId;
  }

  getPhoneNumber(): string {
    return this.phoneNumber;
  }

  getEmail(): string {
    return this.email;
  }

  hasAllInfo(): boolean {
    return !!this.phoneNumber && !!this.nationalId;
  }
}
