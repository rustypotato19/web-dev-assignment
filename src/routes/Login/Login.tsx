import { useContext, useState } from "react";

import Header from "../../components/header/Header";
import { validEmail, validLoginPassword } from "../../utils/auth/LogonHandler";
import { useNavigate } from "react-router";
import { setSession } from "../../utils/auth/SessionHandler";
import SessionContext from "../../utils/contexts/sessions/SessionContext";
import MyError from "../error/Error";

export default function Login() {
  const ctx = useContext(SessionContext);

  const [emailTouched, setEmailTouched] = useState<boolean>(false);
  const [passwordTouched, setPasswordTouched] = useState<boolean>(false);

  const [keepSession, setKeepSession] = useState<boolean>(false);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const navigation = useNavigate();
  const validEmailState = validEmail(email);
  const validPasswordState = validLoginPassword(password);
  const validCredentials = validEmailState && validPasswordState;

  function onSignIn() {
    if (!validCredentials) {
      setEmailTouched(true);
      setPasswordTouched(true);
      return;
    }

    if (keepSession) {
      setSession(email);
    }

    if (ctx) {
      ctx.deriveUserVariablesToContext();
    }

    navigation("/home");
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
          Login
        </h1>

        <div className="bg-white p-8 rounded-2xl shadow w-full max-w-sm border-4 border-(--local-green) flex flex-col gap-4">
          {/* EMAIL */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-2xl" htmlFor="username">
              Email or Username
            </label>
            <input
              className="border rounded-xl w-full px-3 py-2"
              id="username"
              name="username"
              type="text"
              autoComplete="on"
              placeholder="Email or Username"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (!emailTouched) setEmailTouched(true);
              }}
            />
          </div>

          {/* PASSWORD */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-2xl" htmlFor="password">
              Password
            </label>
            <input
              className="border rounded-xl w-full px-3 py-2"
              id="password"
              type="password"
              name="password"
              autoComplete="on"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (!passwordTouched) setPasswordTouched(true);
              }}
            />
          </div>

          {/* ERROR MESSAGE */}
          <div className="min-h-6 transition-all">
            <p className="text-red-600">
              {emailTouched && !validEmailState
                ? "Invalid email format"
                : passwordTouched && !validPasswordState
                  ? "Password too short"
                  : ""}
            </p>
          </div>

          {/* BUTTON + CHECKBOX */}
          <div className="flex flex-col items-center gap-2">
            <button
              className="text-2xl font-bold text-white bg-(--local-green) py-3 px-6 rounded-xl shadow-xl border hover:scale-105 hover:bg-(--local-green-light) transition-all duration-200 active:bg-(--local-green-dark) cursor-pointer disabled:cursor-not-allowed disabled:opacity-25 disabled:scale-100"
              onClick={onSignIn}
              disabled={!validCredentials}
            >
              Sign In
            </button>

            <div className="flex flex-row gap-2">
              <input
                type="checkbox"
                checked={keepSession}
                onChange={() => setKeepSession((x) => !x)}
              />
              <p>Keep me signed in</p>
            </div>
          </div>
        </div>

        {/* SIGNUP LINK */}
        <div className="flex items-center justify-between">
          <a
            className="inline-block font-bold text-sm text-(--local-green) hover:text-(--local-green-dark) mt-4 text-center w-full hover:scale-105 duration-300 transition-all"
            href="/signup"
          >
            Don't have an account? Sign up
          </a>
        </div>
      </div>
    </div>
  );
}
