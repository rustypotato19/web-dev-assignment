import { useEffect, useState } from "react";
import AuthContext, { type AuthUser } from "./AuthContext";

type Props = {
  children: React.ReactNode;
};

export default function AuthContextProvider({ children }: Props) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const isLoggedIn = !!user;

  // =========================
  // HYDRATE FROM LOCALSTORAGE
  // =========================
  useEffect(() => {
    const storedUid = localStorage.getItem("uid");

    if (!storedUid) return;

    const uid = Number(storedUid);

    fetch(`http://localhost:9003/api/users/${uid}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data?.uid) {
          logout();
          return;
        }

        setUser(data);
      })
      .catch((err) => {
        console.error("Failed to hydrate user:", err);
        logout();
      });
  }, []);

  // =========================
  // SYNC LOCALSTORAGE WITH USER
  // =========================
  useEffect(() => {
    if (user?.uid) {
      localStorage.setItem("uid", String(user.uid));
    }
  }, [user]);

  // =========================
  // LOGOUT
  // =========================
  function logout() {
    setUser(null);
    localStorage.removeItem("uid");
  }

  // =========================
  // RENDER
  // =========================
  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,

        setUser,

        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
