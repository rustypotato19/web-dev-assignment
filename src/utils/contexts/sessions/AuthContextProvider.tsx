import { useEffect, useState } from "react";
import AuthContext, { type AuthUser } from "./AuthContext";
import { useNavigate } from "react-router";

type Props = {
  children: React.ReactNode;
};

export default function AuthContextProvider({ children }: Props) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const isLoggedIn = !!user;

  const navigate = useNavigate();

  // =========================
  // HYDRATE FROM LOCALSTORAGE
  // =========================
  useEffect(() => {
    const storedUid = localStorage.getItem("uid");

    if (!storedUid) return;

    const uid = Number(storedUid);

    fetch(`https://webdev.aboutkonrad.com/api/users/id/${uid}`)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    navigate("/");
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
