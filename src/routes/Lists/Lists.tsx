import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { FolderHeart, Plus, Users, X } from "lucide-react";

import AuthContext from "../../utils/contexts/sessions/AuthContext";
import { ContextInitError } from "../../components/error/Error";
import Header from "../../components/header/Header";

import type { List } from "../../utils/types/Types";

export default function Lists() {
  const ctx = useContext(AuthContext);

  const { username: paramUsername } = useParams();

  const navigate = useNavigate();

  const isMe = !paramUsername;

  const [userLists, setUserLists] = useState<List[] | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    async function fetchLists() {
      console.log("Fetching lists for", isMe ? "current user" : paramUsername);

      let fetchUid: number | undefined;

      if (isMe) {
        if (!ctx?.user) {
          console.error("No user in context");

          const storedUid = localStorage.getItem("uid");

          if (!storedUid) {
            console.error("No uid in localStorage");
            return;
          }

          fetchUid = parseInt(storedUid, 10);
        } else {
          fetchUid = ctx.user.uid;
        }
      } else {
        try {
          const res = await fetch(
            `https://webdev.aboutkonrad.com/api/users/username/${paramUsername}`,
          );

          if (!res.ok) {
            throw new Error(`Failed to fetch user data: ${res.statusText}`);
          }

          const data = await res.json();

          fetchUid = data.uid;
        } catch (error) {
          console.error("Error fetching user data:", error);
          return;
        }
      }

      try {
        const listsRes = await fetch(
          `https://webdev.aboutkonrad.com/api/lists/user/${fetchUid}`,
        );

        if (!listsRes.ok) {
          throw new Error(`Failed to fetch lists: ${listsRes.statusText}`);
        }

        const listsData = await listsRes.json();

        setUserLists(listsData);
      } catch (error) {
        console.error("Error fetching lists:", error);
      }
    }

    fetchLists();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createList() {
    try {
      let uid: number | undefined;

      if (ctx?.user?.uid) {
        uid = ctx.user.uid;
      } else {
        const storedUid = localStorage.getItem("uid");

        if (!storedUid) {
          console.error("No uid found");
          return;
        }

        uid = parseInt(storedUid, 10);
      }

      if (!createForm.name.trim()) {
        return;
      }

      const res = await fetch(
        `https://webdev.aboutkonrad.com/api/lists/create/${uid}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(createForm),
        },
      );

      if (!res.ok) {
        throw new Error("Failed to create list");
      }

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to create list");
      }

      setUserLists((prev) => (prev ? [...prev, data.list] : [data.list]));

      setShowCreateModal(false);

      setCreateForm({
        name: "",
        description: "",
      });

      navigate(`/list/${data.list.listid}`);
    } catch (err) {
      console.error(err);
    }
  }

  if (!ctx) {
    return <ContextInitError />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* BODY */}
      <div className="w-full bg-linear-to-br from-(--local-green-light)/80 to-(--local-green-dark)">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-center gap-5">
            <div className="w-22 h-22 rounded-3xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl">
              <FolderHeart size={60} className="text-white" />
            </div>

            <div className="text-white">
              <h1 className="text-4xl font-bold tracking-tight">
                {isMe ? "My Lists" : `${paramUsername}'s Lists`}
              </h1>

              <p className="mt-2 text-white/80 text-lg">
                Browse your gift lists.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-(--local-green-dark)">
                {isMe ? "Your Lists" : "Lists"}
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {userLists?.length ?? 0} total lists
              </p>
            </div>

            {isMe && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-(--local-green) text-white hover:bg-(--local-green-light) hover:scale-105 transition-all duration-300 shadow-sm cursor-pointer"
              >
                <Plus size={16} />
                Create List
              </button>
            )}
          </div>

          {/* LISTS */}
          {userLists && userLists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userLists.map((list) => (
                <a
                  href={`/list/${list.listid}`}
                  key={list.listid}
                  className="border rounded-2xl p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300 bg-white cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-xl text-black">
                        {list.name}
                      </h3>

                      <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                        {list.description || "No description provided."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-5 text-sm text-gray-500">
                    <Users size={16} />
                    <p>{list.members?.length ?? 0} members</p>
                  </div>

                  <button className="mt-5 px-4 py-2 rounded-xl border border-(--local-green)/20 text-(--local-green-dark) hover:bg-(--local-green) hover:text-white transition-all duration-300 text-sm font-medium cursor-pointer">
                    View List
                  </button>
                </a>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-200 rounded-2xl py-16 px-6 flex flex-col items-center justify-center text-center">
              <div className="w-18 h-18 rounded-2xl bg-(--local-green-light)/20 flex items-center justify-center text-(--local-green-dark)">
                <FolderHeart size={34} />
              </div>

              <h3 className="mt-5 text-2xl font-bold text-black">
                No lists yet
              </h3>

              <p className="mt-2 text-gray-500">
                Create your first curated wishlist.
              </p>

              {isMe && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-6 px-5 py-3 rounded-xl bg-(--local-green) text-white hover:bg-(--local-green-light) hover:scale-105 transition-all duration-300 shadow-sm cursor-pointer"
                >
                  Create Your First List
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CREATE LIST MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-500 overflow-hidden">
            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-bold text-(--local-green-dark)">
                  Create List
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Make a new curated gift list.
                </p>
              </div>

              <button
                onClick={() => setShowCreateModal(false)}
                className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-all duration-200 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* BODY */}
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    List Name
                  </label>

                  <input
                    type="text"
                    placeholder="Birthday Wishlist"
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-2xl border border-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-(--local-green-light)/50 focus:border-(--local-green) transition-all"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Description
                  </label>

                  <textarea
                    placeholder="(optional) Describe your list..."
                    value={createForm.description}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-2xl border border-neutral-500 min-h-30 resize-none focus:outline-hidden focus:ring-2 focus:ring-(--local-green-light)/50 focus:border-(--local-green) transition-all"
                  />
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center justify-end gap-3 mt-8">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-3 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all duration-200 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  onClick={createList}
                  disabled={createForm.name === null || createForm.name === ""}
                  className="px-5 py-3 rounded-xl bg-(--local-green) text-white hover:bg-(--local-green-light) hover:scale-105 transition-all duration-300 shadow-sm cursor-pointer flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 disabled:bg-(--local-green)"
                >
                  <Plus size={18} />
                  Create List
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
