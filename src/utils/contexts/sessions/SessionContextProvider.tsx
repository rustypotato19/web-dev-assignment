import { useEffect, useState } from "react";
import SessionContext from "./SessionContext";
import { Cookies } from "react-cookie";

type Props = {
  children: React.ReactNode;
};

export default function SessionContextProvider({ children }: Props) {
  const cookies = new Cookies();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");

  function deriveUserVariablesToContext() {
    setIsLoggedIn(cookies.get("loggedIn"));
    setEmail(cookies.get("email"));
    setUsername(cookies.get("username"));
  }

  /* On Mount */
  useEffect(() => {
    function onMount() {
      if (cookies.get("sessionId")) {
        deriveUserVariablesToContext();
      }
    }
    onMount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SessionContext.Provider
      value={{
        isLoggedIn,
        email,
        username,
        setIsLoggedIn,
        setEmail,
        setUsername,

        deriveUserVariablesToContext,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
