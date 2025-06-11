import { InvitationStatus } from "../../../context/shared/domain/invitationStatus";

export interface InvitationResponseDto {
  id: string;
  bandId: string;
  userId: string;
  status: InvitationStatus;
  createdAt?: Date;
}
