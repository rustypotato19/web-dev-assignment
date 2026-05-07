import { useEffect, useState } from "react";
import SessionContext from "./SessionContext";
import { Cookies } from "react-cookie";

type Props = {
  children: React.ReactNode;
};

export default function SessionContextProvider({ children }: Props) {
  const cookies = new Cookies();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const [email, setEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [fullname, setFullname] = useState<string | null>(null);

  function sessionUserVariablesToContext(): void {
    setIsLoggedIn(!!cookies.get("loggedIn"));
    setEmail(cookies.get("email") ?? "");
    setUsername(cookies.get("username") ?? "");
    setFullname(cookies.get("fullname") ?? "");
  }

  function contextUserVariablesToSession(
    cookies: Cookies,
    override?: {
      email?: string;
      username?: string;
      fullname?: string;
    },
  ): void {
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);

    if (override?.username ?? username)
      cookies.set("username", override?.username ?? username, {
        path: "/",
        expires,
      });

    if (override?.email ?? email)
      cookies.set("email", override?.email ?? email, { path: "/", expires });

    if (override?.fullname ?? fullname)
      cookies.set("fullname", override?.fullname ?? fullname, {
        path: "/",
        expires,
      });
  }

  /* ON MOUNT */
  useEffect(() => {
    if (cookies.get("sessionId")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      sessionUserVariablesToContext();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SessionContext.Provider
      value={{
        isLoggedIn,
        email,
        username,
        fullname,
        setIsLoggedIn,
        setEmail,
        setUsername,
        setFullname,

        sessionUserVariablesToContext,
        contextUserVariablesToSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
