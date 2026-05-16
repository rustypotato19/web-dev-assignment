import Header from "../../components/header/Header";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useContext } from "react";
import { useNavigate } from "react-router";
import AuthContext from "../../utils/contexts/sessions/AuthContext";

export default function Landing() {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  useEffect(() => {
    if (!auth) return;

    // redirect if user is logged in
    console.log("is loggedin?", auth.isLoggedIn);

    if ((auth.isLoggedIn && auth.user) || localStorage.getItem("uid")) {
      navigate("/home");
    }
  }, [auth, navigate]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <Header />

      {/* HERO */}
      <section className="w-full px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-24 pb-10">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center gap-5 sm:gap-6">
          <h1 className="text-4xl sm:text-6xl md:text-7xl xl:text-8xl font-bold text-(--local-green-dark) wrap-break-word leading-tight">
            mygiftlist.com
          </h1>

          <p className="text-lg sm:text-2xl lg:text-3xl text-gray-700 max-w-4xl leading-relaxed">
            Your one stop for easy gift collaboration
          </p>

          {/* BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 w-full sm:w-auto">
            <a
              href="/login"
              className="w-full sm:w-auto text-lg sm:text-xl min-w-55 text-center rounded-3xl border-2 sm:border-3 border-(--local-green-dark) bg-(--local-green-light) px-6 py-3 font-bold hover:scale-105 duration-300 transition-all text-white"
            >
              Login
            </a>

            <a
              href="/signup"
              className="w-full sm:w-auto text-lg sm:text-xl min-w-55 text-center rounded-3xl border-2 sm:border-3 border-black bg-(--local-green-dark) px-6 py-3 font-bold hover:scale-105 duration-300 transition-all text-white"
            >
              Sign Up
            </a>
          </div>
        </div>
      </section>

      {/* SHOWCASE */}
      <section className="w-full px-4 sm:px-6 lg:px-8 pb-12 sm:pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-10 items-stretch">
            <AnimatePresence mode="sync">
              <motion.div
                initial={{ x: -300, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 1.1 }}
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
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 1.1 }}
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
      </section>
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
    <div className="w-full min-h-65 sm:min-h-80 lg:min-h-90 rounded-2xl shadow-lg flex flex-col items-center justify-center gap-4 sm:gap-6 p-6 sm:p-8 border bg-white text-center">
      <h2 className="text-2xl sm:text-3xl font-bold wrap-break-word">
        {title}
      </h2>

      <p className="text-base sm:text-lg text-gray-700 max-w-xl leading-relaxed">
        {description}
      </p>

      {image && (
        <img src={image} className="w-20 h-20 sm:w-24 sm:h-24 object-contain" />
      )}
    </div>
  );
}
