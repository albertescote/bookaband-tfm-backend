import UserId from "../../shared/domain/userId";
import RefreshTokenId from "./refreshTokenId";
import { REFRESH_TOKEN_EXPIRES_IN_SECONDS } from "../config";

export interface RefreshTokenPrimitives {
  id: string;
  userId: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
}

export class RefreshToken {
  private constructor(
    private readonly id: RefreshTokenId,
    private readonly userId: UserId,
    private readonly token: string,
    private readonly createdAt: Date,
    private readonly expiresAt: Date,
  ) {}

  static create(token: string, userId: UserId): RefreshToken {
    return new RefreshToken(
      RefreshTokenId.generate(),
      userId,
      token,
      new Date(),
      new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_SECONDS * 1000),
    );
  }

  static fromPrimitives(data: RefreshTokenPrimitives): RefreshToken {
    return new RefreshToken(
      new RefreshTokenId(data.id),
      new UserId(data.userId),
      data.token,
      data.createdAt,
      data.expiresAt,
    );
  }

  toPrimitives(): RefreshTokenPrimitives {
    return {
      id: this.id.toPrimitive(),
      userId: this.userId.toPrimitive(),
      token: this.token,
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
    };
  }
}
