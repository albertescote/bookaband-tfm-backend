import { InvitationStatus } from "../../../context/invitation/domain/invitation";

export interface InvitationResponseDto {
  id: string;
  bandId: string;
  userId: string;
  status: InvitationStatus;
  createdAt?: Date;
}
