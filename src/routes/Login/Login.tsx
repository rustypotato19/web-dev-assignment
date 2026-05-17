import { useContext, useEffect, useState } from "react";
import Header from "../../components/header/Header";
import { useNavigate } from "react-router";
import AuthContext from "../../utils/contexts/sessions/AuthContext";
import MyError, { ContextInitError } from "../../components/error/Error";
import {
  validEmail,
  validLoginPassword,
  validUsername,
} from "../../utils/auth/LogonHandler";
import { fetchUserByUid } from "../../utils/db/Db";
import { Eye, EyeClosed } from "lucide-react";

export default function Login() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    function validateIdentifierAndPass() {
      if (!identifier && !password) {
        setError(false);
        setErrorMessage("");
        return;
      }

      const isEmail = identifier.includes("@");

      if (identifier) {
        if (isEmail && !validEmail(identifier)) {
          setErrorMessage("Invalid email format");
          setError(true);
          return;
        }

        if (!isEmail && !validUsername(identifier)[0]) {
          setErrorMessage(validUsername(identifier)[1]);
          setError(true);
          return;
        }
      }

      if (password && password.length > 0 && !validLoginPassword(password)) {
        setErrorMessage("Password too short");
        setError(true);
        return;
      }

      setError(false);
      setErrorMessage("");
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
    setErrorMessage("");

    try {
      if (!identifier || !password) {
        setError(true);
        setErrorMessage("Please enter your credentials.");
        return;
      }

      const isEmail = identifier.includes("@");

      const endpoint = isEmail
        ? "https://webdev.aboutkonrad.com/api/auth/login/email"
        : "https://webdev.aboutkonrad.com/api/auth/login/username";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(isEmail
            ? { email: identifier.trim() }
            : { username: identifier.trim() }),
          password,
        }),
      });

      let data = null;

      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid server response");
      }

      if (!res.ok || !data?.success) {
        const serverMessage =
          data?.error || data?.message || "Login failed. Check credentials.";

        setError(true);
        setErrorMessage(serverMessage);
        return;
      }

      if (!data?.user?.uid) {
        throw new Error("Missing user data");
      }

      localStorage.setItem("uid", String(data.user.uid));

      const fullUser = await fetchUserByUid(data.user.uid);

      if (!fullUser) {
        setError(true);
        setErrorMessage("Failed to load user profile.");
        return;
      }

      if (auth) {
        auth.setUser(fullUser);
      } else {
        <ContextInitError />;
      }

      navigate("/home");
    } catch (err: unknown) {
      console.error(err);

      setError(true);
      setErrorMessage(
        (err as { message?: string })?.message ||
          "Login failed. Check credentials.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden">
      <Header />

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-10">
        <div className="w-full max-w-md flex flex-col items-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-(--local-green-dark) text-center">
            Login
          </h1>

          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow w-full border-2 sm:border-4 border-(--local-green) flex flex-col gap-5">
            {/* IDENTIFIER */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-lg sm:text-2xl">
                Email or Username
              </label>

              <input
                className="border rounded-xl w-full px-3 py-3 text-sm sm:text-base outline-none focus:border-black"
                type="text"
                placeholder="Email or Username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>

            {/* PASSWORD */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-lg sm:text-2xl">
                Password
              </label>

              <div className="relative flex items-center border rounded-xl w-full pr-3 focus-within:border-black">
                <input
                  className="w-full px-3 py-3 text-sm sm:text-base rounded-xl outline-none border-0 bg-transparent"
                  type={passwordVisible ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                {passwordVisible ? (
                  <Eye
                    size={20}
                    className="cursor-pointer shrink-0"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  />
                ) : (
                  <EyeClosed
                    size={20}
                    className="cursor-pointer shrink-0"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  />
                )}
              </div>
            </div>

            {/* ERROR */}
            <p
              className={`text-sm min-h-5 ${
                error ? "text-red-600" : "text-transparent"
              }`}
            >
              {errorMessage}
            </p>

            {/* BUTTON */}
            <button
              onClick={handleLogin}
              disabled={!identifier || !password || loading || error}
              className="w-full text-lg sm:text-xl font-bold text-white bg-(--local-green) py-3 px-6 rounded-xl shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>

          {/* SIGNUP LINK */}
          <a
            href="/signup"
            className="mt-5 text-(--local-green) font-bold hover:scale-105 transition-all text-sm sm:text-base"
          >
            Don't have an account? Sign up
          </a>
        </div>
      </div>
    </div>
  );
}
