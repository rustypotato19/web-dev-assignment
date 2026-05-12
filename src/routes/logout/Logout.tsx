import { useContext, useEffect } from "react";
import AuthContext from "../../utils/contexts/sessions/AuthContext";
import { useNavigate } from "react-router";

export default function Logout() {
  const auth = useContext(AuthContext);

  const navigate = useNavigate();

  useEffect(() => {
    auth?.logout();
  }, [auth]);

  if (!auth) {
    // ensure logout with a manual override
    localStorage.removeItem("uid");
    navigate("/");
  }

  return <div>Logging out...</div>;
}
