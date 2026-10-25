import { Navigate, useLocation } from "react-router-dom";

/** Old class links (`/student?code=…`) open the class-code sign in. */
export default function StudentLinkRedirect() {
  const { search } = useLocation();
  return <Navigate to={`/login/class${search}`} replace />;
}
