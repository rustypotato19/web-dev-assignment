import { useParams } from "react-router";
import Header from "../../components/header/Header";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function About() {
  const { anchor } = useParams();

  useEffect(() => {
    if (anchor) {
      document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" });
    }
  }, [anchor]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header sticky={true} />

      <div className="max-w-4xl w-full mx-auto px-6 py-10 flex flex-col gap-12">
        {/* ================= MAIN ================= */}
        <section id="Main" className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold text-(--local-green-dark)">
            About This Project
          </h1>

          <p className="text-gray-700 leading-relaxed">
            This site started from a simple, real-world problem; Figuring out
            who is buying what, and when, for events.
          </p>

          <p className="text-gray-700 leading-relaxed">
            I am a solo developer, and this is a passion project built to create
            something genuinely useful and enjoyable while contributing
            positively to the internet.
          </p>
        </section>

        {/* ================= FULL NAME + DOB ================= */}
        <section id="FullNameDOB" className="flex flex-col gap-4 border-t pt-8">
          <h2 className="text-2xl font-semibold text-(--local-green-dark)">
            Why we ask for your name and date of birth
          </h2>

          <div className="flex flex-col gap-3 text-gray-700 leading-relaxed">
            <p>
              Your <span className="font-semibold">full name</span> helps make
              interactions more natural and recognisable. It's what your friends
              and family will first see, along with your profile picture.
            </p>

            <p>
              Your <span className="font-semibold">date of birth</span> is used
              for:
            </p>

            <ul className="list-disc pl-6 flex flex-col gap-2">
              <li>Birthday tracking and reminders</li>
              <li>
                Enforcing a minimum age requirement. We do not believe very
                young individuals should face unnecessary exposure to the
                internet.
              </li>
            </ul>
          </div>
        </section>

        {/* ================= COOKIES ================= */}
        <section id="Cookies" className="flex flex-col gap-4 border-t pt-8">
          <h2 className="text-2xl font-semibold text-(--local-green-dark)">
            Cookies & Data Usage
          </h2>

          <div className="flex flex-col gap-3 text-gray-700 leading-relaxed">
            <p>
              This site uses cookies to store login information and improve your
              experience.
            </p>

            <p className="font-semibold text-(--local-green-dark)">
              We do NOT, and vow to never intentionally pass forward data to
              third parties for monetary compensation or otherwise.
            </p>

            <p>
              Interested to find out how cookies work? Read this simple article
              @{" "}
              <a
                target="_blank"
                rel="noopener noreferrer"
                title="Opens in a new tab"
                className="text-blue-700 font-medium hover:text-blue-500 cursor-pointer active:text-blue-900"
                href="https://medium.com/@hendelRamzy/how-session-and-cookies-works-640fb3f349d1"
              >
                Medium.com
              </a>
            </p>
          </div>
        </section>

        {/* ================= Icons ================= */}
        <section id="Cookies" className="flex flex-col gap-4 border-t pt-8">
          <h2 className="text-2xl font-semibold text-(--local-green-dark)">
            Icons & Imagery Declaration
          </h2>

          <div className="flex flex-col gap-3 text-gray-700 leading-relaxed">
            <p>
              All icons and icon imagery are very gratefully attributed to the
              publically available{" "}
              <a
                target="_blank"
                rel="noopener noreferrer"
                title="Opens in a new tab"
                href="https://lucide.dev/guide/react/"
                className="text-blue-700 font-medium hover:text-blue-500 cursor-pointer active:text-blue-900"
              >
                lucide-react
              </a>{" "}
              package
            </p>
          </div>
        </section>

        {/* ================= CONTACT ================= */}
        <ContactSection />

        {/* FOOTER */}
        <div className="text-center text-sm text-gray-500 pt-6">
          Built independently with care.
        </div>
      </div>
    </div>
  );
}

/* ================= CONTACT COMPONENT ================= */

function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState(false);

  const valid = name.trim() && email.trim() && message.trim();

  function handleSubmit() {
    setTouched(true);

    if (!valid) return;

    // 🔥 Placeholder for backend call
    console.log({
      to: "rustypotato19@gmail.com",
      name,
      email,
      message,
    });

    setSent(true);

    // reset
    setName("");
    setEmail("");
    setMessage("");
  }

  return (
    <section id="Contact" className="flex flex-col gap-4 border-t pt-8">
      <h2 className="text-2xl font-semibold text-(--local-green-dark)">
        Contact the Creator
      </h2>

      <p className="text-gray-700">
        Have feedback, ideas, or found an issue? Feel free to reach out.
      </p>

      <motion.div
        className="flex flex-col gap-4 bg-white p-5 rounded-2xl border shadow"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {sent && (
          <p className="text-green-600 font-semibold">
            Message sent successfully.
          </p>
        )}

        <input
          type="text"
          placeholder="Your name"
          className="border rounded-xl px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Your email"
          className="border rounded-xl px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <textarea
          placeholder="Your message"
          className="border rounded-xl px-3 py-2 min-h-30"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        {!valid && touched && (
          <p className="text-red-500 text-sm">
            Please fill out all fields before sending.
          </p>
        )}

        <button
          onClick={handleSubmit}
          className="bg-(--local-green) text-white py-2 rounded-xl hover:scale-102 disabled:scale-100 disabled:cursor-not-allowed transition disabled:opacity-40"
          disabled={!valid}
        >
          Send Message
        </button>
      </motion.div>

      <p className="text-xs text-gray-500">
        Messages will be sent to:{" "}
        <a
          href="mailto:rustypotato19@gmail.com"
          className="text-(--local-green) hover:text-(--local-green-dark) underline transition"
          title="Opens your email client"
        >
          rustypotato19@gmail.com
        </a>
      </p>
    </section>
  );
}
