import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { checkSession } from "../../utils/auth/SessionHandler";
import { Cookies } from "react-cookie";
import { useNavigate } from "react-router";
import SessionContext from "../../utils/contexts/sessions/SessionContext";
import MyError from "../../routes/error/Error";

type Props = {
  sticky?: true;
};

export default function Header({ sticky }: Props) {
  const ctx = useContext(SessionContext);

  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const navigate = useNavigate();

  /* On Mount */
  useEffect(() => {
    if (!checkSession) navigate("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ctx) {
    return (
      <MyError
        ErrorCode={1002}
        ErrorMessage="Context failed to initiialise. Please try again."
      />
    );
  }

  return (
    <>
      <div
        className={`${sticky && "sticky top-0"} relative w-screen h-fit flex items-center justify-between bg-(--local-green) text-white p-8 z-30 shadow-xl`}
      >
        <a
          href="/"
          className="text-2xl font-bold hover:scale-105 duration-300 transition-all"
        >
          mygiftlist.com
        </a>
        <h1 className="text-2xl font-bold">
          <AnimatePresence>
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: menuOpen ? 180 : 0 }}
              transition={{ duration: 0.75 }}
              className="w-fit h-fit border rounded-full pt-0.5 px-0.5 hover:bg-(--local-green-light) duration-300 transition-all cursor-pointer"
              onClick={() => {
                setMenuOpen((prev) => !prev);
              }}
            >
              <ChevronDown width={32} height={32} />
            </motion.div>
          </AnimatePresence>
        </h1>
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
  const ctx = useContext(SessionContext);

  const loggedIn = checkSession();

  const cookies = new Cookies();

  const navigate = useNavigate();

  const navItems = loggedIn
    ? {
        Home: "/home",
        "My Lists": "/lists",
        "My Profile": `/profile`,
        About: "/about",
        Logout: "",
      }
    : {
        Landing: "/",
        Login: "/login",
        Register: "/register",
        About: "/about",
      };

  const urlBase = "http://localhost:5173";

  if (!ctx) {
    return (
      <MyError
        ErrorCode={1002}
        ErrorMessage="Context failed to initialise. Please try again."
      />
    );
  }

  return (
    <motion.div
      initial={{ y: -150 }}
      animate={{ y: 0 }}
      exit={{ y: -150 }}
      transition={{ duration: 0.8 }}
      className="w-fit h-fit absolute top-25 right-0 bg-(--local-green) shadow-xl text-white rounded-b-2xl overflow-hidden pb-1"
    >
      <div className="w-full h-full flex flex-col items-center justify-center rounded-b-2xl">
        {Object.entries(navItems).map(([label, href], index) =>
          label === "Logout" ? (
            <button
              key={index}
              className={`text-xl font-bold bg-(--local-green) ${index === 0 ? "border-b-2" : index === Object.keys(navItems).length - 1 ? "border-t-2" : "border-y-2"} border-(--local-green) hover:border-(--local-green-light) hover:bg-(--local-green-dark) transition-all duration-300 w-full h-full text-center cursor-pointer py-2 px-4`}
              onClick={() => {
                const allCookies = cookies.getAll();

                Object.keys(allCookies).forEach((cookieName) => {
                  cookies.remove(cookieName);
                });

                console.log("Logged out. Cleared all cookies.");

                navigate("/");
              }}
            >
              {label}
            </button>
          ) : (
            <a
              href={href}
              key={index}
              className={`text-xl font-bold bg-(--local-green) ${index === 0 ? "border-b-2" : index === Object.keys(navItems).length - 1 ? "border-t-2" : "border-y-2"} border-(--local-green) hover:border-(--local-green-light) hover:bg-(--local-green-dark) transition-all duration-300 w-full h-full text-center cursor-pointer py-2 px-4`}
              hidden={window.location.href === urlBase + href}
            >
              {label}
            </a>
          ),
        )}
      </div>
    </motion.div>
  );
}
