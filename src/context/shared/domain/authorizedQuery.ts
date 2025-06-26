import { UserAuthInfo } from "./userAuthInfo";

export interface AuthorizedQuery {
  get authorized(): UserAuthInfo;
}
