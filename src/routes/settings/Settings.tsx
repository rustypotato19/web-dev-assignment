import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";

import {
  User,
  Mail,
  Calendar,
  Lock,
  Image,
  Trash2,
  Save,
  AlertTriangle,
} from "lucide-react";

import Header from "../../components/header/Header";
import AuthContext from "../../utils/contexts/sessions/AuthContext";
import { ContextInitError } from "../../components/error/Error";

type UserData = {
  uid: number;
  username: string;
  fullname: string;
  email: string;
  date_of_birth: string;
  profile_image: string;
  created: string;
};

export default function Settings() {
  const ctx = useContext(AuthContext);

  const navigate = useNavigate();

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

        const res = await fetch(`http://localhost:9003/api/users/${uid}`);

        if (!res.ok) {
          throw new Error("Failed to fetch user");
        }

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

  function handleDrag(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();

    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImage(e.dataTransfer.files[0]);
    }
  }

  function handleImage(file: File | null) {
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      const result = reader.result as string;

      setProfilePreview(result);

      setForms((prev) => ({
        ...prev,
        profile_image: result,
      }));
    };

    reader.readAsDataURL(file);
  }

  async function updateUsername() {
    if (!user) return;

    try {
      const res = await fetch(
        `http://localhost:9003/api/users/username/${user.username}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newUsername: forms.username,
          }),
        },
      );

      const data = await res.json();

      setUser(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function updateFullname() {
    if (!user) return;

    try {
      const res = await fetch(
        `http://localhost:9003/api/users/fullname/${user.uid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newFullname: forms.fullname,
          }),
        },
      );

      const data = await res.json();

      setUser(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function updateEmail() {
    if (!user) return;

    try {
      const res = await fetch(
        `http://localhost:9003/api/users/email/${user.uid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newEmail: forms.email,
          }),
        },
      );

      const data = await res.json();

      setUser(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function updateDOB() {
    if (!user) return;

    try {
      const res = await fetch(
        `http://localhost:9003/api/users/date-of-birth/${user.uid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newDateOfBirth: forms.date_of_birth,
          }),
        },
      );

      const data = await res.json();

      setUser(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function updateProfileImage() {
    if (!user) return;

    try {
      const res = await fetch(
        `http://localhost:9003/api/users/profile-image/${user.uid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newProfileImage: forms.profile_image,
          }),
        },
      );

      const data = await res.json();

      setUser(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function updatePassword() {
    if (!user) return;

    try {
      await fetch(`http://localhost:9003/api/users/password/${user.uid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newPassword: forms.password,
        }),
      });

      setForms((prev) => ({
        ...prev,
        password: "",
      }));
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteAccount() {
    if (!user) return;

    try {
      await fetch(`http://localhost:9003/api/users/${user.uid}`, {
        method: "DELETE",
      });

      localStorage.removeItem("uid");

      navigate("/");
    } catch (err) {
      console.error(err);
    }
  }

  if (!ctx) {
    return <ContextInitError />;
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="max-w-5xl mx-auto px-6 py-12">
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* HERO */}
      <div className="w-full bg-linear-to-br from-(--local-green-light)/80 to-(--local-green-dark)">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-center gap-5">
            <div className="w-22 h-22 rounded-3xl overflow-hidden bg-white/15 backdrop-blur-md border border-white/20 shadow-xl">
              {profilePreview ? (
                <img
                  src={profilePreview}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User size={46} className="text-white" />
                </div>
              )}
            </div>

            <div className="text-white">
              <h1 className="text-4xl font-bold tracking-tight">
                Account Settings
              </h1>

              <p className="mt-2 text-white/80 text-lg">
                Manage your profile and account preferences.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* USERNAME */}
          <SettingsCard
            icon={<User size={20} />}
            title="Username"
            description="Your public username."
          >
            <div className="flex gap-3">
              <input
                value={forms.username}
                onChange={(e) =>
                  setForms((prev) => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-(--local-green-light)/50"
              />

              <SaveButton onClick={updateUsername} />
            </div>
          </SettingsCard>

          {/* FULL NAME */}
          <SettingsCard
            icon={<User size={20} />}
            title="Full Name"
            description="Your real name."
          >
            <div className="flex gap-3">
              <input
                value={forms.fullname}
                onChange={(e) =>
                  setForms((prev) => ({
                    ...prev,
                    fullname: e.target.value,
                  }))
                }
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-(--local-green-light)/50"
              />

              <SaveButton onClick={updateFullname} />
            </div>
          </SettingsCard>

          {/* EMAIL */}
          <SettingsCard
            icon={<Mail size={20} />}
            title="Email"
            description="Your account email address."
          >
            <div className="flex gap-3">
              <input
                type="email"
                value={forms.email}
                onChange={(e) =>
                  setForms((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-(--local-green-light)/50"
              />

              <SaveButton onClick={updateEmail} />
            </div>
          </SettingsCard>

          {/* DATE OF BIRTH */}
          <SettingsCard
            icon={<Calendar size={20} />}
            title="Date of Birth"
            description="Update your birthday."
          >
            <div className="flex gap-3">
              <input
                type="date"
                value={forms.date_of_birth}
                onChange={(e) =>
                  setForms((prev) => ({
                    ...prev,
                    date_of_birth: e.target.value,
                  }))
                }
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-(--local-green-light)/50"
              />

              <SaveButton onClick={updateDOB} />
            </div>
          </SettingsCard>

          {/* PROFILE IMAGE */}
          <SettingsCard
            icon={<Image size={20} />}
            title="Profile Image"
            description="Upload or change your profile picture."
          >
            <div className="space-y-5">
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
                        <User size={72} strokeWidth={1.5} />

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

              {/* Remove */}
              {profilePreview && (
                <button
                  type="button"
                  onClick={() => {
                    setProfilePreview(null);

                    setForms((prev) => ({
                      ...prev,
                      profile_image: "",
                    }));
                  }}
                  className="text-sm text-red-500 hover:text-red-700 transition-all duration-200 hover:scale-105 cursor-pointer"
                >
                  Remove Image
                </button>
              )}

              <SaveButton onClick={updateProfileImage} />
            </div>
          </SettingsCard>

          {/* PASSWORD */}
          <SettingsCard
            icon={<Lock size={20} />}
            title="Password"
            description="Change your password."
          >
            <div className="flex gap-3">
              <input
                type="password"
                value={forms.password}
                onChange={(e) =>
                  setForms((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                placeholder="New password"
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-(--local-green-light)/50"
              />

              <SaveButton onClick={updatePassword} />
            </div>
          </SettingsCard>

          {/* DELETE ACCOUNT */}
          <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                <AlertTriangle size={22} />
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-bold text-red-600">
                  Delete Account
                </h2>

                <p className="text-gray-600 mt-2">
                  Permanently delete your account and all associated data.
                </p>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="mt-5 flex items-center gap-2 px-5 py-3 rounded-xl bg-red-600 text-white hover:bg-red-500 transition-all duration-300 cursor-pointer"
                >
                  <Trash2 size={18} />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 size={28} />
              </div>

              <h2 className="text-2xl font-bold text-center mt-5">
                Delete Account?
              </h2>

              <p className="text-gray-500 text-center mt-3">
                This action cannot be undone.
              </p>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-5 py-3 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  onClick={deleteAccount}
                  className="flex-1 px-5 py-3 rounded-xl bg-red-600 text-white hover:bg-red-500 transition-all cursor-pointer"
                >
                  Delete
                </button>
              </div>
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
    <div className="bg-white rounded-2xl border shadow-sm p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-(--local-green-light)/20 text-(--local-green-dark) flex items-center justify-center">
          {icon}
        </div>

        <div className="flex-1">
          <h2 className="text-xl font-bold text-(--local-green-dark)">
            {title}
          </h2>

          <p className="text-gray-500 mt-1 mb-5">{description}</p>

          {children}
        </div>
      </div>
    </div>
  );
}

function SaveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-5 py-3 rounded-xl bg-(--local-green) text-white hover:bg-(--local-green-light) hover:scale-105 transition-all duration-300 shadow-sm cursor-pointer flex items-center gap-2"
    >
      <Save size={18} />
      Save
    </button>
  );
}
