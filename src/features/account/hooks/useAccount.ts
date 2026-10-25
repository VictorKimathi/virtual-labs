import { useLiveData } from "../../classroom/hooks/useLiveData";
import { watchAccount } from "../account.api";

/** The signed-in person and their profile, or null when signed out. */
export function useAccount() {
  return useLiveData(watchAccount, "account");
}
