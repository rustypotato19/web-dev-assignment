import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import AuthContext from "../../utils/contexts/sessions/AuthContext";
import MyError from "../error/Error";

type Props = {
  sticky?: boolean;
};

export default function Header({ sticky }: Props) {
  const auth = useContext(AuthContext);

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!auth) return;
  }, [auth]);

  if (!auth) {
    return (
      <MyError
        ErrorCode={1002}
        ErrorMessage="Auth context failed to initialise."
      />
    );
  }

  return (
    <>
      <div
        className={`${
          sticky && "sticky top-0"
        } relative w-screen flex items-center justify-between bg-(--local-green) text-white p-8 z-30 shadow-xl`}
      >
        <a
          href="/"
          className="text-2xl font-bold hover:scale-105 transition-all duration-300"
        >
          mygiftlist.com
        </a>

        <div
          className="w-fit border rounded-full px-1 pt-0.5 cursor-pointer hover:bg-(--local-green-light) transition-all duration-300"
          onClick={() => setMenuOpen((p) => !p)}
        >
          <motion.div
            animate={{ rotate: menuOpen ? 180 : 0 }}
            transition={{ duration: 0.4 }}
          >
            <ChevronDown width={32} height={32} />
          </motion.div>
        </div>
      </div>

      <div className="z-20">
        <AnimatePresence mode="wait">
          {menuOpen && <NavModal />}
        </AnimatePresence>
      </div>
    </>
  );
}

function NavModal() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  if (!auth) {
    return (
      <MyError
        ErrorCode={1002}
        ErrorMessage="Auth context failed to initialise."
      />
    );
  }

  const navItems = auth.isLoggedIn
    ? {
        Home: "/home",
        "My Lists": "/lists",
        "My Profile": `/profile/${auth.user?.username}`,
        About: "/about",
      }
    : {
        Landing: "/",
        Login: "/login",
        Register: "/register",
        About: "/about",
      };

  return (
    <motion.div
      initial={{ y: -275 }}
      animate={{ y: 0 }}
      exit={{ y: -275 }}
      transition={{ duration: 0.8 }}
      className="absolute right-0 top-24 bg-(--local-green) shadow-xl text-white rounded-b-2xl overflow-hidden"
    >
      <div className="flex flex-col w-48 text-center">
        {Object.entries(navItems).map(([label, href]) => (
          <a
            key={label}
            href={href}
            className="text-lg font-bold py-3 border-y border-(--local-green) hover:bg-(--local-green-dark) transition-all"
          >
            {label}
          </a>
        ))}

        {auth.isLoggedIn && (
          <button
            className="text-lg font-bold py-3 border-t border-(--local-green) hover:bg-(--local-green-dark)"
            onClick={() => {
              auth.logout();
              navigate("/");
            }}
          >
            Logout
          </button>
        )}
      </div>
    </motion.div>
  );
}
