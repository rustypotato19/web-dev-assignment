import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import { FolderHeart, Plus, Sparkles, Users } from "lucide-react";

import AuthContext from "../../utils/contexts/sessions/AuthContext";
import { ContextInitError } from "../../components/error/Error";
import Header from "../../components/header/Header";

import type { List } from "../../utils/types/Types";

export default function Lists() {
  const ctx = useContext(AuthContext);
  const { username: paramUsername } = useParams();

  const isMe = !paramUsername;

  const [userLists, setUserLists] = useState<List[] | null>(null);

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
            `http://localhost:9003/api/users/username/${paramUsername}`,
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
          `http://localhost:9003/api/lists/user/${fetchUid}`,
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

  if (!ctx) {
    return <ContextInitError />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* HERO */}
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
                Browse curated your owned gift lists.
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
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-(--local-green) text-white hover:bg-(--local-green-light) hover:scale-105 transition-all duration-300 shadow-sm cursor-pointer">
                <Plus size={16} />
                Create List
              </button>
            )}
          </div>

          {/* LISTS */}
          {userLists && userLists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userLists.map((list) => (
                <div
                  key={list.listid}
                  className="border rounded-2xl p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300 bg-white"
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

                    <div className="w-10 h-10 rounded-xl bg-(--local-green-light)/20 flex items-center justify-center text-(--local-green-dark)">
                      <Sparkles size={18} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-5 text-sm text-gray-500">
                    <Users size={16} />
                    <p>{list.members?.length ?? 0} members</p>
                  </div>

                  <button className="mt-5 px-4 py-2 rounded-xl border border-(--local-green)/20 text-(--local-green-dark) hover:bg-(--local-green) hover:text-white transition-all duration-300 text-sm font-medium cursor-pointer">
                    View List
                  </button>
                </div>
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

              <p className="mt-2 text-gray-500 max-w-md">
                Start building collections of your favourite places,
                restaurants, or experiences.
              </p>

              {isMe && (
                <button className="mt-6 px-5 py-3 rounded-xl bg-(--local-green) text-white hover:bg-(--local-green-light) hover:scale-105 transition-all duration-300 shadow-sm cursor-pointer">
                  Create Your First List
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
