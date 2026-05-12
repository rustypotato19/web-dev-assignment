import { useContext, useEffect, useState } from "react";
import Header from "../../components/header/Header";
import { useNavigate } from "react-router";
import AuthContext from "../../utils/contexts/sessions/AuthContext";
import MyError from "../../components/error/Error";
import {
  validEmail,
  validLoginPassword,
  validUsername,
} from "../../utils/auth/LogonHandler";
import { fetchUserByUid } from "../../utils/db/Db";

export default function Login() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState(""); // email OR username
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("OK");

  useEffect(() => {
    function validateIdentifierAndPass() {
      const isEmail = identifier.includes("@");

      if (isEmail && !validEmail(identifier)) {
        setErrorMessage("Invalid email format");
        setError(true);
      } else if (!isEmail && !validUsername(identifier)[0]) {
        setErrorMessage(validUsername(identifier)[1]);
        setError(true);
      } else if (
        !validLoginPassword(password) &&
        identifier &&
        password.length > 0
      ) {
        setErrorMessage("Password too short");
        setError(true);
      } else {
        setError(false);
        setErrorMessage("OK");
      }
    }
    validateIdentifierAndPass();
  }, [identifier, password]);

  if (!auth) {
    return (
      <MyError
        ErrorCode={1002}
        ErrorMessage="Auth context failed to initialise"
      />
    );
  }

  async function handleLogin() {
    setLoading(true);
    setError(false);

    try {
      const isEmail = identifier.includes("@");

      const endpoint = isEmail
        ? "http://localhost:9003/api/auth/login/email"
        : "http://localhost:9003/api/auth/login/username";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: isEmail ? identifier : undefined,
          username: !isEmail ? identifier : undefined,
          password,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error("Invalid credentials");
      }

      auth?.setUser(await fetchUserByUid(data.user.uid));

      console.log("User logged in?", auth?.isLoggedIn);
      console.log("Context user object?", auth?.user);

      localStorage.setItem("uid", data.user.uid);

      navigate("/home");
    } catch (err) {
      console.error(err);
      setError(true);
      setErrorMessage("Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-4 text-(--local-green-dark)">
          Login
        </h1>

        <div className="bg-white p-8 rounded-2xl shadow w-full max-w-sm border-4 border-(--local-green) flex flex-col gap-4">
          {/* IDENTIFIER */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-2xl">Email or Username</label>
            <input
              className="border rounded-xl w-full px-3 py-2"
              type="text"
              placeholder="Email or Username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>

          {/* PASSWORD */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-2xl">Password</label>
            <input
              className="border rounded-xl w-full px-3 py-2"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* ERROR */}
          <p className={`${error ? "text-red-600" : "text-white"} text-sm`}>
            {errorMessage}
          </p>

          {/* BUTTON */}
          <button
            onClick={handleLogin}
            disabled={!identifier || !password || loading}
            className="text-2xl font-bold text-white bg-(--local-green) py-3 px-6 rounded-xl shadow-xl hover:scale-105 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        {/* SIGNUP LINK */}
        <a
          href="/signup"
          className="mt-4 text-(--local-green) font-bold hover:scale-105 transition-all"
        >
          Don't have an account? Sign up
        </a>
      </div>
    </div>
  );
}
