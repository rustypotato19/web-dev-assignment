import { AnimatePresence, motion } from "framer-motion";
import { CircleChevronDown } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import AuthContext from "../../utils/contexts/sessions/AuthContext";
import { ContextInitError } from "../error/Error";

export default function Header() {
  const auth = useContext(AuthContext);

  const [menuOpen, setMenuOpen] = useState(false);

  const headerHeight = 96 + 32 + 32; // 96 height, 32 pt, 32 pb

  useEffect(() => {
    //
    // This is a permanent fallback which, once per mount, tries to set the logged in user
    // into context if they have a valid session, but the context is not set
    // for some reason (e.g. page refresh)
    //

    if (!auth) return;

    if (!auth.isLoggedIn && localStorage.getItem("uid")) {
      const storedUid = localStorage.getItem("uid");

      const result = fetch(
        `https://webdev.aboutkonrad.com/api/users/id/${storedUid}`,
      );

      const handleResult = async () => {
        try {
          const res = await result;
          if (!res.ok) {
            throw new Error(`Failed to fetch user data: ${res.statusText}`);
          }
          const data = await res.json();

          if (!data?.uid) {
            throw new Error("Invalid user data");
          }

          auth.setUser(data);
          console.log("[HEADER] Hydrated user from localStorage:", data);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      handleResult();
    } else {
      console.log(
        "[HEADER] No stored UID or user already logged in, skipping hydration",
      );
      console.log("[HEADER] localStorage UID:", localStorage.getItem("uid"));
      console.log("[HEADER] Auth context state:", auth);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!auth) {
    return <ContextInitError />;
  }

  return (
    <>
      <div
        className={`relative w-screen flex items-center justify-between bg-(--local-green) text-white h-24 p-8 z-30 shadow-xl`}
      >
        <a
          href="/"
          className="text-2xl font-bold hover:scale-105 transition-all duration-300"
        >
          mygiftlist.com
        </a>

        <div
          className="w-fit cursor-pointer "
          onClick={() => setMenuOpen((p) => !p)}
        >
          <motion.div
            animate={{ rotate: menuOpen ? 180 : 0 }}
            transition={{ duration: 0.4 }}
          >
            <CircleChevronDown
              width={48}
              height={48}
              strokeWidth={1}
              className="hover:bg-(--local-green-light) transition-all duration-300 rounded-full"
            />
          </motion.div>
        </div>
      </div>

      <div className="z-20">
        <AnimatePresence mode="wait">
          {menuOpen && <NavModal pxOffset={headerHeight} />}
        </AnimatePresence>
      </div>
    </>
  );
}

function NavModal({ pxOffset }: { pxOffset: number }) {
  const auth = useContext(AuthContext);

  const itemHeight = 48;

  if (!auth) {
    return <ContextInitError />;
  }

  const navItems = auth.isLoggedIn
    ? {
        Home: "/home",
        "My Lists": "/lists",
        "My Profile": `/profile/${auth.user?.username}`,
        Settings: "/settings",
        About: "/about",
        Logout: "/logout",
      }
    : {
        Landing: "/",
        Login: "/login",
        Register: "/register",
        About: "/about",
      };

  // +2 for 1px on top and bottom borders
  //
  const animationOffset =
    itemHeight * Object.keys(navItems).length +
    2 +
    12 * Object.keys(navItems).length;

  return (
    <motion.div
      initial={{ y: -animationOffset }}
      animate={{ y: 0 }}
      exit={{ y: -animationOffset }}
      transition={{ duration: 0.8 }}
      className={`absolute right-0 top-${pxOffset} bg-(--local-green) shadow-xl text-white rounded-b-2xl overflow-hidden border border-(--local-green-dark)`}
    >
      <div className={`flex flex-col w-40 h-${itemHeight} text-center`}>
        {Object.entries(navItems).map(([label, href]) => (
          <a
            key={label}
            href={href}
            className="text-lg font-bold py-3 border-y border-(--local-green-dark) hover:bg-(--local-green-dark) transition-all"
          >
            {label}
          </a>
        ))}
      </div>
    </motion.div>
  );
}
