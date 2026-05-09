import Header from "../../components/header/Header";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import AuthContext from "../../utils/contexts/sessions/AuthContext";
import { useContext } from "react";

export default function Landing() {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  useEffect(() => {
    if (!auth) return;

    // only redirect if we actually KNOW state
    console.log("is loggedin?", auth.isLoggedIn);
    if ((auth.isLoggedIn && auth.user) || localStorage.getItem("uid")) {
      navigate("/home");
    }
  }, [auth, navigate]);

  return (
    <div>
      <Header />

      <div className="w-screen min-h-60 h-fit flex flex-col justify-center items-center gap-6 z-0">
        <h1 className="text-8xl font-bold text-(--local-green-dark)">
          mygiftlist.com
        </h1>
        <p className="text-3xl">Your one stop for easy gift collaboration</p>
      </div>

      <div className="text-white flex flex-row items-center justify-around w-1/3 mx-auto min-h-20 h-fit">
        <a
          href="/login"
          className="text-xl min-w-36 text-center rounded-3xl border-3 border-(--local-green-dark) bg-(--local-green-light) px-5 py-3 font-bold hover:scale-105 duration-300 transition-all"
        >
          Login
        </a>

        <a
          href="/signup"
          className="text-xl min-w-36 text-center rounded-3xl border-3 border-black bg-(--local-green-dark) px-5 py-3 font-bold hover:scale-105 duration-300 transition-all"
        >
          Sign Up
        </a>
      </div>

      <div className="w-screen min-h-100 h-fit flex justify-center items-center">
        <div className="w-2/3 flex flex-row justify-around items-center gap-12">
          <AnimatePresence mode="sync">
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 1.5 }}
              className="w-full"
            >
              <ShowcaseBox
                title="Make lists"
                description="Create lists for your friends and family to see"
              />
            </motion.div>

            <motion.div
              initial={{ x: 300, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 1.5 }}
              className="w-full"
            >
              <ShowcaseBox
                title="Mark other's items"
                description="See and mark off your friends' and families' lists - completely anonymously"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

type ShowcaseBoxProps = {
  title: string;
  description: string;
  image?: string;
};

function ShowcaseBox({ title, description, image }: ShowcaseBoxProps) {
  return (
    <div className="w-full h-80 rounded-xl shadow-lg flex flex-col items-center justify-center gap-4 p-6 border">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-center">{description}</p>
      {image && <img src={image} className="w-24 h-24" />}
    </div>
  );
}
