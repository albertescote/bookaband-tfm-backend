import { InvitationStatus } from "../../shared/domain/invitationStatus";

export interface UserInvitation {
  id: string;
  bandId: string;
  bandName: string;
  userId: string;
  status: InvitationStatus;
  createdAt?: Date;
}
