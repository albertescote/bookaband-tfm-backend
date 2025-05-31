import UserId from "../../shared/domain/userId";
import { BandRole } from "./bandRole";

export interface BandMember {
  id: UserId;
  role: BandRole;
}
