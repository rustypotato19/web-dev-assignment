import { useContext, useEffect, useState } from "react";
import Header from "../../components/header/Header";
import { AnimatePresence, motion } from "framer-motion";
import {
  validDob,
  validEmail,
  validFullName,
  validUsername,
} from "../../utils/auth/LogonHandler";
import {
  CircleCheck,
  CircleQuestionMark,
  CircleX,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router";
import AuthContext from "../../utils/contexts/sessions/AuthContext";
import MyError from "../../components/error/Error";

export default function Signup() {
  const ctx = useContext(AuthContext);

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

  // FULLNAME

  const [name, setName] = useState<string>("");
  const [nameTouched, setNameTouched] = useState<boolean>(false);

  // DOB
  const [date, setDate] = useState<string>("");
  const [dateTouched, setDateTouched] = useState<boolean>(false);

  // PFP
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // =========================
  // DERIVED VALIDATION
  // =========================

  // Email
  const emailIsValid = validEmail(email);
  const emailsMatch = email === emailVer && email !== "";
  const [emailExists, setEmailExists] = useState<boolean>(false);

  const emailErrorMessage = !emailTouched
    ? "Enter your email"
    : !emailIsValid
      ? "Invalid email"
      : emailVerTouched && !emailsMatch
        ? "Emails do not match"
        : emailExists
          ? "Email already exists"
          : "OK";

  useEffect(() => {
    async function validateEmail() {
      try {
        const res = await fetch(
          `http://localhost:9003/api/auth/ver/email/${encodeURIComponent(email)}`,
        );

        const data = await res.json();

        console.log(data);

        setEmailExists(data.exists);
      } catch (err) {
        console.error(err);
        return false;
      }
    }
    if (emailsMatch) validateEmail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, emailVer]);

  // Username
  const usernameValid = validUsername(username)[0];
  const [usernameExists, setUsernameExists] = useState<boolean>(false);
  const usernameErrorMessage = usernameExists
    ? "Username already taken"
    : validUsername(username)[1];

  useEffect(() => {
    if (username === "" || password === "") return;

    const currentUsername = username;

    async function validateUsername() {
      try {
        const res = await fetch(
          `http://localhost:9003/api/auth/ver/username/${encodeURIComponent(currentUsername)}`,
        );

        const data = await res.json();

        // ignore stale responses
        if (currentUsername !== username) return;

        setUsernameExists(data.exists);
      } catch (err) {
        console.error(err);
      }
    }

    validateUsername();
  }, [username, password]);

  // Fullname
  const nameValid = validFullName(name);

  // DoB
  const [dobValid, setDobValid] = useState<boolean>(false);
  const [dobErrorMessage, setDobErrorMessage] = useState<string>("OK");

  useEffect(() => {
    function validateDob() {
      if (date) {
        const res = validDob(new Date(date));
        setDobValid(res[0]);
        setDobErrorMessage(res[1]);
      }
    }
    validateDob();
  }, [date]);

  // Password rules
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const hasMinLength = password.length >= 8;

  const passwordValid =
    hasLower && hasUpper && hasNumber && hasSpecial && hasMinLength;

  // =========================
  // STEP VALIDATION
  // =========================

  const canProceedStep0 = emailIsValid && emailsMatch && !emailExists;
  const canProceedStep1 = nameValid && dobValid;
  const canProceedStep2 = true;
  const canProceedStep3 = usernameValid && passwordValid && !usernameExists;

  const totalSteps = 4;
  const progress = ((stepCounter + 1) / totalSteps) * 100;

  const [loading, setLoading] = useState<boolean>(false);

  // =========================
  // UI HELPERS
  // =========================

  const bulletClass = (valid: boolean, touched: boolean) =>
    `flex flex-row justify-start items-center gap-1 ${touched ? (valid ? "text-green-600" : "text-red-600") : "text-gray-400"} transition-all duration-300`;

  // =========================
  // FUNCTIONS
  // =========================

  async function onAccountCreate() {
    setLoading(true);

    try {
      const res = await fetch("http://localhost:9003/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          username,
          fullname: name,
          date_of_birth: date,
          password,
          profile_image: profilePreview,
        }),
      });

      const data = await res.json();

      if (!data.success) throw new Error();

      const userRes = await fetch(
        `http://localhost:9003/api/users/${data.uid}`,
      );

      const userData = await userRes.json();

      ctx?.setUser(userData);

      localStorage.setItem("uid", data.uid);

      navigate("/home");
    } catch {
      alert("Signup failed");
    } finally {
      setLoading(false);
    }
  }

  function handleImage(file: File | null) {
    if (!file) return;

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement("canvas");

      const MAX_WIDTH = 250;
      const scale = MAX_WIDTH / img.width;

      canvas.width = MAX_WIDTH;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // compress to jpeg
      const compressed = canvas.toDataURL("image/jpeg", 0.7);

      setProfilePreview(compressed);
    };

    reader.readAsDataURL(file);
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    handleImage(file);
  }

  function exportData() {
    const data = [username, name, password, email, profilePreview];
    return data;
  }

  // =========================
  // Context Return
  // =========================

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
            {/* STEP 1: EMAIL */}
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
                    (!emailsMatch && emailVerTouched) ||
                    emailErrorMessage != "OK"
                      ? "text-red-600"
                      : "text-white"
                  }`}
                >
                  {emailErrorMessage}
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

            {/* ========================= */}
            {/* STEP 2: Name and DOB */}
            {/* ========================= */}
            {stepCounter === 1 && (
              <div className="flex flex-col gap-6 w-full">
                {/* Full Name */}
                <div className="flex flex-col gap-2">
                  <h2 className="font-semibold text-2xl">Full Name</h2>
                  <input
                    type="text"
                    name="fullname"
                    autoComplete="on"
                    placeholder="John Doe"
                    className={`border rounded-xl w-full px-3 py-2 ${name != "" && "font-semibold"}`}
                    value={name}
                    autoCapitalize="on"
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!nameTouched) setNameTouched(true);
                    }}
                  />
                  <p
                    className={
                      nameTouched && !nameValid ? "text-red-600" : "text-white"
                    }
                  >
                    Invalid Name
                  </p>
                </div>

                {/* DOB */}
                <div className="flex flex-col gap-2">
                  <input
                    type="date"
                    name="dob"
                    placeholder="19/05/2004"
                    className={`border rounded-xl px-3 py-2 w-full uppercase ${date === "" ? "text-neutral-600/80" : "font-medium"}`}
                    value={date}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) => {
                      setDate(e.target.value);
                      if (!dateTouched) setDateTouched(true);
                    }}
                  />
                  <p
                    className={
                      dateTouched && !dobValid ? "text-red-600" : "text-white"
                    }
                  >
                    {dobErrorMessage}
                  </p>
                </div>

                {/* Next Button */}
                <button
                  className="text-2xl font-bold text-white bg-(--local-green) py-3 px-6 rounded-xl shadow-xl border hover:scale-105 hover:bg-(--local-green-light) transition-all duration-200 active:bg-(--local-green-dark) cursor-pointer disabled:cursor-not-allowed disabled:opacity-25 disabled:scale-100 disabled:bg-(--local-green)"
                  onClick={() => {
                    if (canProceedStep1) {
                      setStepCounter((x) => x + 1);
                    } else {
                      setEmailTouched(true);
                      setEmailVerTouched(true);
                    }
                  }}
                  disabled={!canProceedStep1}
                >
                  Next
                </button>
                <a
                  href="/about/FullNameDOB"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Opens in a new tab"
                  className="max-w-full w-fit mx-auto flex flex-row items-center justify-center gap-2 opacity-50 hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  <CircleQuestionMark size={24} />
                  <p className="w-40 text-xs font-semibold">
                    Why do we ask for this information?
                  </p>
                </a>
              </div>
            )}

            {/* =========================== */}
            {/* STEP 3: Profile Picture */}
            {/* =========================== */}

            {stepCounter === 2 && (
              <div className="flex flex-col gap-6 w-full items-center">
                <h2 className="font-semibold text-2xl text-center">
                  Add a Profile Picture (Optional)
                </h2>

                {/* Upload Circle */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`group relative w-40 h-40 rounded-full overflow-hidden border-3 transition-all duration-300
      ${
        dragActive
          ? "border-(--local-green) scale-105 bg-green-50"
          : "border-(--local-green-light) hover:border-(--local-green)"
      }`}
                >
                  <label className="w-full h-full cursor-pointer flex items-center justify-center">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImage(e.target.files?.[0] || null)}
                    />

                    {/* Image */}
                    {profilePreview ? (
                      <>
                        <img
                          src={profilePreview}
                          alt="Profile Preview"
                          className="w-full h-full object-cover"
                        />

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                          <p className="text-white text-sm font-semibold text-center px-3">
                            Click to change
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Empty State */}
                        <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
                          <UserRound size={72} strokeWidth={1.5} />

                          <p className="text-sm font-medium text-center px-4">
                            Click to upload
                          </p>
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-(--local-green)/10 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      </>
                    )}
                  </label>
                </div>

                {/* Remove Button */}
                {profilePreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setProfilePreview(null);
                    }}
                    className="text-sm text-red-500 hover:text-red-700 transition-all duration-200 hover:scale-105 cursor-pointer"
                  >
                    Remove Image
                  </button>
                )}

                {/* Actions */}
                <div className="flex w-fit mx-auto">
                  <button
                    className="text-2xl font-bold text-white bg-(--local-green) py-3 px-6 rounded-xl shadow-xl border hover:scale-105 hover:bg-(--local-green-light) transition-all duration-200 active:bg-(--local-green-dark) cursor-pointer disabled:cursor-not-allowed disabled:opacity-25 disabled:scale-100 disabled:bg-(--local-green)"
                    onClick={() => {
                      if (canProceedStep2) {
                        setStepCounter((x) => x + 1);
                      }
                    }}
                    disabled={!canProceedStep2}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* =========================== */}
            {/* STEP 4: USERNAME + PASSWORD */}
            {/* =========================== */}
            {stepCounter === 3 && (
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
                      (usernameTouched && !usernameValid) || usernameExists
                        ? "text-red-600"
                        : "text-white"
                    }
                  >
                    {usernameErrorMessage}
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

                {/* Create Account Button */}
                <button
                  className="text-2xl font-bold text-white bg-(--local-green) py-3 px-6 rounded-xl shadow-xl border hover:scale-105 hover:bg-(--local-green-light) transition-all duration-200 active:bg-(--local-green-dark) cursor-pointer disabled:cursor-not-allowed disabled:opacity-25 disabled:scale-100"
                  onClick={() => {
                    if (canProceedStep3) {
                      onAccountCreate();
                    } else {
                      setUsernameTouched(true);
                      setPasswordTouched(true);
                    }
                    console.log(exportData());
                  }}
                  disabled={!canProceedStep3 && !loading}
                >
                  {loading ? "Creating Account..." : "Create Account"}
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
