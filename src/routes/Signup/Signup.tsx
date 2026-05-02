import { useContext, useState } from "react";
import Header from "../../components/header/Header";
import { AnimatePresence, motion } from "framer-motion";
import { validEmail } from "../../utils/auth/LogonHandler";
import { CircleCheck, CircleX } from "lucide-react";
import { useNavigate } from "react-router";
import { setSession } from "../../utils/auth/SessionHandler";
import SessionContext from "../../utils/contexts/sessions/SessionContext";
import MyError from "../error/Error";

export default function Signup() {
  const ctx = useContext(SessionContext);

  const [stepCounter, setStepCounter] = useState<number>(0);

  const navigate = useNavigate();

  // EMAIL
  const [email, setEmail] = useState<string>("");
  const [emailVer, setEmailVer] = useState<string>("");
  const [emailTouched, setEmailTouched] = useState<boolean>(false);
  const [emailVerTouched, setEmailVerTouched] = useState<boolean>(false);

  // USERNAME
  const [username, setUsername] = useState<string>("");
  const [usernameTouched, setUsernameTouched] = useState<boolean>(false);

  // PASSWORD
  const [password, setPassword] = useState<string>("");
  const [passwordTouched, setPasswordTouched] = useState<boolean>(false);

  // =========================
  // DERIVED VALIDATION
  // =========================

  // Email
  const emailIsValid = validEmail(email);
  const emailsMatch = email === emailVer && email !== "";

  // Username
  const usernameValid = username.length >= 3;

  // Password rules
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const hasMinLength = password.length >= 8;

  const passwordValid =
    hasLower && hasUpper && hasNumber && hasSpecial && hasMinLength;

  const [keepSession, setKeepSession] = useState<boolean>(false);

  // =========================
  // STEP VALIDATION
  // =========================

  const canProceedStep0 = emailIsValid && emailsMatch;
  const canProceedStep1 = usernameValid && passwordValid;

  const totalSteps = 2;
  const progress = (stepCounter / totalSteps) * 100;

  // =========================
  // UI HELPERS
  // =========================

  const bulletClass = (valid: boolean, touched: boolean) =>
    `flex flex-row justify-start items-center gap-1 ${touched ? (valid ? "text-green-600" : "text-red-600") : "text-gray-400"}`;

  // =========================
  // FUNCTIONS
  // =========================

  function onAccountCreate() {
    if (keepSession) setSession(email, username);

    if (ctx) {
      ctx.deriveUserVariablesToContext();
    }

    setTimeout(() => {
      navigate("/home");
    }, 1500);
  }

  if (!ctx) {
    return (
      <MyError
        ErrorCode={1002}
        ErrorMessage="Context failed to initiialise. Please try again."
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-4 text-(--local-green-dark)">
          Sign Up
        </h1>
        <div className="w-90 flex flex-col items-center justify-center gap-2 mb-3">
          <p className="text-sm text-gray-600">
            Part {stepCounter + 1} of {totalSteps}
          </p>

          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden border border-(--local-green-dark)">
            <div
              className="h-full bg-(--local-green) transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={stepCounter}
            className="bg-white p-8 rounded-2xl shadow w-full max-w-sm border-4 border-(--local-green) flex flex-col gap-5"
            initial={{ x: 150, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -150, opacity: 0 }}
            transition={{ duration: 0.75 }}
          >
            {/* ========================= */}
            {/* STEP 0: EMAIL */}
            {/* ========================= */}
            {stepCounter === 0 && (
              <div className="flex flex-col gap-6 w-full">
                <div className="flex flex-col gap-2">
                  <h2 className="font-semibold text-2xl">Enter Email</h2>
                  <input
                    type="email"
                    name="email"
                    autoComplete="on"
                    placeholder="janedoe@gmail.com"
                    className="border rounded-xl w-full px-3 py-2"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (!emailTouched) setEmailTouched(true);
                    }}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <h2 className="font-semibold text-2xl">Confirm Email</h2>
                  <input
                    type="email"
                    name="email"
                    autoComplete="off"
                    placeholder="janedoe@gmail.com"
                    className="border rounded-xl w-full px-3 py-2"
                    value={emailVer}
                    onChange={(e) => {
                      setEmailVer(e.target.value);
                      if (!emailVerTouched) setEmailVerTouched(true);
                    }}
                  />
                </div>

                <p
                  className={`text-left ${
                    (!emailIsValid && emailTouched) ||
                    (!emailsMatch && emailVerTouched)
                      ? "text-red-600"
                      : "text-white"
                  }`}
                >
                  {!emailTouched
                    ? "Enter your email"
                    : !emailIsValid
                      ? "Invalid email"
                      : emailVerTouched && !emailsMatch
                        ? "Emails do not match"
                        : "All good!"}
                </p>

                {/* Next Button */}
                <button
                  className="text-2xl font-bold text-white bg-(--local-green) py-3 px-6 rounded-xl shadow-xl border hover:scale-105 hover:bg-(--local-green-light) transition-all duration-200 active:bg-(--local-green-dark) cursor-pointer disabled:cursor-not-allowed disabled:opacity-25 disabled:scale-100"
                  onClick={() => {
                    if (canProceedStep0) {
                      setStepCounter((x) => x + 1);
                    } else {
                      setEmailTouched(true);
                      setEmailVerTouched(true);
                    }
                  }}
                  disabled={!canProceedStep0}
                >
                  Next
                </button>
              </div>
            )}

            {/* =========================== */}
            {/* STEP 1: USERNAME + PASSWORD */}
            {/* =========================== */}
            {stepCounter === 1 && (
              <div className="flex flex-col gap-6 w-full">
                {/* Username */}
                <div className="flex flex-col gap-2">
                  <h2 className="font-semibold text-2xl">Username</h2>
                  <input
                    type="text"
                    name="username"
                    autoComplete="on"
                    placeholder="username"
                    className={`border rounded-xl w-full px-3 py-2 ${username != "" && "font-semibold"}`}
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (!usernameTouched) setUsernameTouched(true);
                    }}
                  />
                  <p
                    className={
                      usernameTouched && !usernameValid
                        ? "text-red-600"
                        : "text-white"
                    }
                  >
                    Must be at least 3 characters
                  </p>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-2">
                  <h2 className="font-semibold text-2xl">Password</h2>
                  <input
                    type="password"
                    placeholder={"••••••••"}
                    className="border rounded-xl w-full px-3 py-2 font-semibold"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (!passwordTouched) setPasswordTouched(true);
                    }}
                  />

                  {/* Bullet validation */}
                  <ul className="text-sm flex flex-col gap-1 mt-2 w-fit">
                    <li className={bulletClass(hasLower, passwordTouched)}>
                      {hasLower && passwordTouched ? (
                        <CircleCheck width={20} />
                      ) : (
                        <CircleX width={20} />
                      )}{" "}
                      Contains lowercase letter
                    </li>
                    <li className={bulletClass(hasUpper, passwordTouched)}>
                      {hasUpper && passwordTouched ? (
                        <CircleCheck width={20} />
                      ) : (
                        <CircleX width={20} />
                      )}{" "}
                      Contains uppercase letter
                    </li>
                    <li className={bulletClass(hasNumber, passwordTouched)}>
                      {hasNumber && passwordTouched ? (
                        <CircleCheck width={20} />
                      ) : (
                        <CircleX width={20} />
                      )}{" "}
                      Contains a number
                    </li>
                    <li className={bulletClass(hasSpecial, passwordTouched)}>
                      {hasSpecial && passwordTouched ? (
                        <CircleCheck width={20} />
                      ) : (
                        <CircleX width={20} />
                      )}{" "}
                      Contains special character
                    </li>
                    <li className={bulletClass(hasMinLength, passwordTouched)}>
                      {hasMinLength && passwordTouched ? (
                        <CircleCheck width={20} />
                      ) : (
                        <CircleX width={20} />
                      )}{" "}
                      At least 8 characters
                    </li>
                  </ul>
                </div>

                <div className="flex flex-row gap-2">
                  <input
                    type="checkbox"
                    checked={keepSession}
                    onChange={() => setKeepSession((x) => !x)}
                  />
                  <p>Keep me signed in</p>
                </div>

                {/* Create Account Button */}
                <button
                  className="text-2xl font-bold text-white bg-(--local-green) py-3 px-6 rounded-xl shadow-xl border hover:scale-105 hover:bg-(--local-green-light) transition-all duration-200 active:bg-(--local-green-dark) cursor-pointer disabled:cursor-not-allowed disabled:opacity-25 disabled:scale-100"
                  onClick={() => {
                    if (canProceedStep1) {
                      setStepCounter(stepCounter + 1);
                      onAccountCreate();
                    } else {
                      setUsernameTouched(true);
                      setPasswordTouched(true);
                    }
                  }}
                  disabled={!canProceedStep1}
                >
                  Create Account
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        <div className="flex items-center justify-between">
          <a
            className="inline-block align-baseline font-bold text-sm text-(--local-green) hover:text-(--local-green-dark) mt-4 text-center w-full hover:scale-105 duration-300 transition-all"
            href="/login"
          >
            Have an account? Log In
          </a>
        </div>
      </div>
    </div>
  );
}
