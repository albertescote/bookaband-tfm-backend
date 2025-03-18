import BandId from "../../shared/domain/bandId";
import UserId from "../../shared/domain/userId";
import InvitationId from "./invitationId";

export enum InvitationStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  DECLINED = "DECLINED",
}

export interface InvitationPrimitives {
  id: string;
  bandId: string;
  userId: string;
  status: InvitationStatus;
  createdAt?: Date;
}

export default class Invitation {
  constructor(
    private id: InvitationId,
    private bandId: BandId,
    private userId: UserId,
    private status: InvitationStatus,
    private createdAt?: Date,
  ) {}

  static create(bandId: BandId, userId: UserId): Invitation {
    return new Invitation(
      InvitationId.generate(),
      bandId,
      userId,
      InvitationStatus.PENDING,
      new Date(),
    );
  }

  static fromPrimitives(primitives: InvitationPrimitives): Invitation {
    return new Invitation(
      new InvitationId(primitives.id),
      new BandId(primitives.bandId),
      new UserId(primitives.userId),
      primitives.status,
      primitives.createdAt,
    );
  }

  toPrimitives(): InvitationPrimitives {
    return {
      id: this.id.toPrimitive(),
      bandId: this.bandId.toPrimitive(),
      userId: this.userId.toPrimitive(),
      status: this.status,
      createdAt: this.createdAt,
    };
  }

  accept(): void {
    this.status = InvitationStatus.ACCEPTED;
  }

  decline(): void {
    this.status = InvitationStatus.DECLINED;
  }

  isPending(): boolean {
    return this.status === InvitationStatus.PENDING;
  }

  isOwner(userId: string): boolean {
    return userId === this.userId.toPrimitive();
  }
}
