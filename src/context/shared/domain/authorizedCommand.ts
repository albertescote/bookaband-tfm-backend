import { UserAuthInfo } from "./userAuthInfo";

export interface AuthorizedCommand {
  get authorized(): UserAuthInfo;
}
