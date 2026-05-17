import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";

import {
  User,
  Mail,
  Calendar,
  Lock,
  Image as ImageIcon,
  Trash2,
  AlertTriangle,
} from "lucide-react";

import Header from "../../components/header/Header";
import AuthContext from "../../utils/contexts/sessions/AuthContext";
import { ContextInitError } from "../../components/error/Error";
import useWindowDimensions from "../../utils/helpers/WindowSize";

type UserData = {
  uid: number;
  username: string;
  fullname: string;
  email: string;
  date_of_birth: string;
  profile_image: string;
  created: string;
};

type SaveState = "idle" | "saving" | "success" | "error";

export default function Settings() {
  const ctx = useContext(AuthContext);
  const navigate = useNavigate();

  const { width } = useWindowDimensions();
  const isMobile = width < 640;

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const [forms, setForms] = useState({
    username: "",
    fullname: "",
    email: "",
    date_of_birth: "",
    profile_image: "",
    password: "",
  });

  const [saveState, setSaveState] = useState<Record<string, SaveState>>({
    username: "idle",
    fullname: "idle",
    email: "idle",
    date_of_birth: "idle",
    profile_image: "idle",
    password: "idle",
  });

  /* ================= FETCH USER ================= */

  useEffect(() => {
    async function fetchUser() {
      try {
        let uid: number | undefined;

        if (ctx?.user?.uid) {
          uid = ctx.user.uid;
        } else {
          const storedUid = localStorage.getItem("uid");
          if (!storedUid) return;
          uid = parseInt(storedUid, 10);
        }

        const res = await fetch(
          `https://webdev.aboutkonrad.com/api/users/id/${uid}`,
        );

        const data = await res.json();

        setUser(data);

        setForms({
          username: data.username || "",
          fullname: data.fullname || "",
          email: data.email || "",
          date_of_birth: data.date_of_birth
            ? data.date_of_birth.split("T")[0]
            : "",
          profile_image: data.profile_image || "",
          password: "",
        });

        setProfilePreview(data.profile_image || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [ctx]);

  /* ================= DRAG + IMAGE ================= */

  function handleDrag(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type !== "dragleave");
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      handleImage(e.dataTransfer.files[0]);
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
      const compressed = canvas.toDataURL("image/jpeg", 0.7);
      setProfilePreview(compressed);
    };

    reader.readAsDataURL(file);
  }

  /* ================= OPTIMISTIC SAVE HELPERS ================= */

  function setSaving(key: string) {
    setSaveState((p) => ({ ...p, [key]: "saving" }));
  }

  function setSuccess(key: string) {
    setSaveState((p) => ({ ...p, [key]: "success" }));
    setTimeout(() => setSaveState((p) => ({ ...p, [key]: "idle" })), 1500);
  }

  function setErrorState(key: string) {
    setSaveState((p) => ({ ...p, [key]: "error" }));
    setTimeout(() => setSaveState((p) => ({ ...p, [key]: "idle" })), 2000);
  }

  /* ================= UPDATE FUNCTIONS ================= */

  async function updateUsername() {
    if (!user) return;

    setSaving("username");

    try {
      const res = await fetch(
        `https://webdev.aboutkonrad.com/api/users/username/${user.username}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newUsername: forms.username }),
        },
      );

      const data = await res.json();

      setUser(data);

      // 🔥 IMPORTANT: optimistic auth fix
      if (ctx?.setUser) {
        ctx.setUser(data);
      }

      localStorage.setItem("uid", String(data.uid));

      setSuccess("username");

      // fix stale routing issue
      //navigate(`/profile/${data.username}`);
    } catch (err) {
      console.error(err);
      setErrorState("username");
    }
  }

  async function updateFullname() {
    if (!user) return;
    setSaving("fullname");

    try {
      const res = await fetch(
        `https://webdev.aboutkonrad.com/api/users/fullname/${user.uid}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newFullname: forms.fullname }),
        },
      );

      const data = await res.json();
      setUser(data);
      ctx?.setUser?.(data);

      setSuccess("fullname");
    } catch (err) {
      setErrorState(`fullname, ${err}`);
    }
  }

  async function updateEmail() {
    if (!user) return;
    setSaving("email");

    try {
      const res = await fetch(
        `https://webdev.aboutkonrad.com/api/users/email/${user.uid}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newEmail: forms.email }),
        },
      );

      const data = await res.json();
      setUser(data);
      ctx?.setUser?.(data);

      setSuccess("email");
    } catch {
      setErrorState("email");
    }
  }

  async function updateDOB() {
    if (!user) return;
    setSaving("date_of_birth");

    try {
      const res = await fetch(
        `https://webdev.aboutkonrad.com/api/users/date-of-birth/${user.uid}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newDateOfBirth: forms.date_of_birth }),
        },
      );

      const data = await res.json();
      setUser(data);
      ctx?.setUser?.(data);

      setSuccess("date_of_birth");
    } catch {
      setErrorState("date_of_birth");
    }
  }

  async function updateProfileImage() {
    if (!user) return;
    setSaving("profile_image");

    try {
      const res = await fetch(
        `https://webdev.aboutkonrad.com/api/users/profile-image/${user.uid}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newProfileImage: forms.profile_image }),
        },
      );

      const data = await res.json();
      setUser(data);
      ctx?.setUser?.(data);

      setSuccess("profile_image");
    } catch {
      setErrorState("profile_image");
    }
  }

  async function updatePassword() {
    if (!user) return;
    setSaving("password");

    try {
      await fetch(
        `https://webdev.aboutkonrad.com/api/users/password/${user.uid}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword: forms.password }),
        },
      );

      setForms((p) => ({ ...p, password: "" }));
      setSuccess("password");
    } catch {
      setErrorState("password");
    }
  }

  async function deleteAccount() {
    if (!user) return;

    await fetch(`https://webdev.aboutkonrad.com/api/users/id/${user.uid}`, {
      method: "DELETE",
    });

    localStorage.removeItem("uid");
    ctx?.setUser?.(null);

    navigate("/");
  }

  /* ================= GUARDS ================= */

  if (!ctx) return <ContextInitError />;

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-5xl mx-auto px-6 py-12">Loading settings...</div>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* HEADER */}
      <div className="w-full bg-linear-to-br from-(--local-green-light)/80 to-(--local-green-dark)">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 text-center sm:text-left">
            <div className="w-20 sm:w-22 h-20 sm:h-22 rounded-3xl overflow-hidden bg-white/15 backdrop-blur-md border border-white/20 shadow-xl flex items-center justify-center">
              {profilePreview ? (
                <img
                  src={profilePreview}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={40} className="text-white" />
              )}
            </div>

            <div className="text-white">
              <h1 className="text-2xl sm:text-4xl font-bold">
                Account Settings
              </h1>
              <p className="text-sm sm:text-lg text-white/80">
                Manage your profile and account preferences.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
        <SettingsCard
          icon={<User />}
          title="Username"
          description="Public username"
        >
          <Field
            value={forms.username}
            onChange={(v) => setForms((p) => ({ ...p, username: v }))}
            onSave={updateUsername}
            state={saveState.username}
          />
        </SettingsCard>

        <SettingsCard icon={<User />} title="Full Name" description="Real name">
          <Field
            value={forms.fullname}
            onChange={(v) => setForms((p) => ({ ...p, fullname: v }))}
            onSave={updateFullname}
            state={saveState.fullname}
          />
        </SettingsCard>

        <SettingsCard icon={<Mail />} title="Email" description="Email address">
          <Field
            value={forms.email}
            onChange={(v) => setForms((p) => ({ ...p, email: v }))}
            onSave={updateEmail}
            state={saveState.email}
          />
        </SettingsCard>

        <SettingsCard icon={<Calendar />} title="DOB" description="Birthday">
          <Field
            type="date"
            value={forms.date_of_birth}
            onChange={(v) => setForms((p) => ({ ...p, date_of_birth: v }))}
            onSave={updateDOB}
            state={saveState.date_of_birth}
          />
        </SettingsCard>

        {/* PROFILE PICTURE */}
        <SettingsCard
          icon={<ImageIcon />}
          title="Profile Picture"
          description=""
        >
          <div className="flex flex-col gap-5 items-center sm:items-start justify-start w-fit mt-4">
            {/* Upload Circle */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`group relative w-24 sm:w-40 h-24 sm:h-40 rounded-full overflow-hidden border-3 transition-all duration-300 flex items-center justify-center
      ${
        dragActive
          ? "border-(--local-green) scale-105 bg-green-50"
          : "border-(--local-green-light) hover:border-(--local-green)"
      }`}
            >
              <label className="absolute inset-0 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImage(e.target.files?.[0] || null)}
                />

                {/* IMAGE STATE */}
                {profilePreview ? (
                  <div className="relative w-full h-full">
                    <img
                      src={profilePreview}
                      className="w-full h-full object-cover block"
                    />

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <p className="text-white text-sm font-medium">Change</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400 gap-1 w-full h-full">
                    <User size={isMobile ? 36 : 52} className="sm:size-10" />
                    <p className="text-xs sm:text-sm text-center">Upload</p>
                  </div>
                )}
              </label>
            </div>

            {/* ACTIONS */}
            <div className="flex items-center mx-auto gap-3">
              <button
                onClick={() => setProfilePreview(null)}
                className="text-sm text-red-500 hover:text-red-700 transition"
              >
                Remove
              </button>

              <SaveButton
                onClick={updateProfileImage}
                state={saveState.profile_image}
              />
            </div>
          </div>
        </SettingsCard>

        <SettingsCard icon={<Lock />} title="Password" description="">
          <Field
            type="password"
            value={forms.password}
            onChange={(v) => setForms((p) => ({ ...p, password: v }))}
            onSave={updatePassword}
            state={saveState.password}
          />
        </SettingsCard>

        {/* DELETE */}
        <div className="bg-white border border-red-200 rounded-2xl p-5 sm:p-6">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 text-red-600 font-bold"
          >
            <Trash2 size={18} />
            Delete Account
          </button>
        </div>
      </div>

      {/* MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md">
            <h2 className="text-xl font-bold">Delete account?</h2>

            <p className="flex items-center gap-2 mt-3 text-red-600">
              <AlertTriangle size={40} /> This action is irreversible and will
              delete all your data. Are you sure?
            </p>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 border p-3 rounded-xl button"
              >
                Cancel
              </button>
              <button
                onClick={deleteAccount}
                className="flex-1 bg-red-600 text-white p-3 rounded-xl button"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= COMPONENTS ================= */

function SettingsCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border rounded-2xl p-5 sm:p-6">
      <div className="flex gap-3 sm:gap-4">
        <div className="text-(--local-green-dark)">{icon}</div>

        <div className="flex-1">
          <h2 className="font-bold text-lg">{title}</h2>
          {description && (
            <p className="text-gray-500 text-sm mb-4">{description}</p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

function Field({
  value,
  onChange,
  onSave,
  state,
  type = "text",
}: {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  state: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 border p-3 rounded-xl"
      />

      <button
        onClick={onSave}
        className="bg-(--local-green) text-white px-5 py-3 rounded-xl"
      >
        {state === "saving"
          ? "Saving..."
          : state === "success"
            ? "Saved ✓"
            : state === "error"
              ? "Error"
              : "Save"}
      </button>
    </div>
  );
}

function SaveButton({
  onClick,
  state,
}: {
  onClick: () => void;
  state: string;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-(--local-green) text-white px-4 py-2 rounded-xl button"
    >
      {state === "saving"
        ? "Saving..."
        : state === "success"
          ? "Saved ✓"
          : "Save"}
    </button>
  );
}
