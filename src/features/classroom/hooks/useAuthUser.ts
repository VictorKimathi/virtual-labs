import { watchUser } from "../classroom.api";
import { useLiveData } from "./useLiveData";

export function useAuthUser() {
  return useLiveData(watchUser, "classroom-auth");
}
