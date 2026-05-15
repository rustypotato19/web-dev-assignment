import Header from "../../components/header/Header";
import AuthContext from "../../utils/contexts/sessions/AuthContext";
import MyError, { ContextInitError } from "../../components/error/Error";
import { useNavigate, useParams } from "react-router";
import { CalendarDays, Users, UserRound, Plus, Trash2 } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { List, User } from "../../utils/types/Types";
import { fetchUidByUsername, fetchUserByUsername } from "../../utils/db/Db";

/* ================= MAIN ================= */

export default function Profile() {
  const ctx = useContext(AuthContext);
  const { username: paramUsername } = useParams();

  const navigate = useNavigate();

  const isOwnProfile =
    !paramUsername ||
    (ctx?.user?.username && paramUsername === ctx.user.username);

  const username = paramUsername || ctx?.user?.username || "";

  const [user, setUser] = useState<User | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [friends, setFriends] = useState<number[] | null>(null);

  /* ================= LIST MODAL ================= */

  const [listModalOpen, setListModalOpen] = useState<boolean>(false);

  async function createList(uid: number, name: string, description: string) {
    if (!ctx || !uid || !name) return;

    const res = await fetch(
      `http://localhost:9003/api/lists/create/${encodeURIComponent(uid)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description }),
      },
    );

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.error || "Failed to create list");
    }

    const listID = data.listid;

    // update list state with new list (optimistic update)
    const newList: List = {
      listid: listID,
      name,
      description,
      members: [1], // creator is first member
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    };
    setLists((prev) => [...prev, newList]);

    // navigate to this new list if possible
    if (listID) {
      setTimeout(() => {
        navigate(`/list/${listID}`);
      }, 1000);
    }
  }

  /* ===== DELETE LIST ===== */

  async function deleteList(listid: number) {
    if (!ctx || !listid) return;

    const res = await fetch(
      `http://localhost:9003/api/lists/delete/${encodeURIComponent(listid)}`,
      {
        method: "DELETE",
      },
    );

    if (!res.ok) {
      throw new Error(`Failed to delete list: ${res.statusText}`);
    }

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.error || "Failed to delete list");
    }

    // update list state by removing the deleted list (optimistic update)
    setLists((prev) => prev.filter((list) => list.listid !== listid));
  }

  /* ================= FETCH USER DATA ================= */

  useEffect(() => {
    async function load() {
      if (!username) return;

      if (ctx?.user && username === ctx.user.username) {
        console.log("[PROFILE] Using context user data for profile");
        setUser(ctx.user);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const fetchedUser: User = await fetchUserByUsername(username);
        setUser(fetchedUser);

        const listRes = await fetch(
          `http://localhost:9003/api/lists/user/${fetchedUser.uid}`,
        );

        const listData = await listRes.json();

        setLists(listData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [ctx?.user, username]);

  /* ================= FETCH FRIENDS ================= */

  useEffect(() => {
    async function loadFriends() {
      let fetchId: number;

      if (user) {
        fetchId = user.uid;
      } else if (username) {
        fetchId = await fetchUidByUsername(username);
      } else {
        setFriends([]);
        return;
      }

      try {
        const friendsRes = await fetch(
          `http://localhost:9003/api/friends/${fetchId}`,
        );
        const friendsData = await friendsRes.json();
        setFriends(friendsData.friends || []);
      } catch (err) {
        console.error("Error fetching friends data:", err);
      }
    }

    loadFriends();
  }, [user, username]);

  /* ================= GUARDS ================= */

  if (!ctx) {
    return <ContextInitError />;
  }

  if (!username) {
    return <MyError ErrorCode={404} ErrorMessage="Username not found." />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading profile...
      </div>
    );
  }

  if (error || !user) {
    return <MyError ErrorCode={404} ErrorMessage={error || "User not found"} />;
  }

  /* ================= VIEW ================= */

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <ProfileLayout
        user={user}
        lists={lists}
        isOwn={isOwnProfile || false}
        listModalOpen={listModalOpen}
        setListModalOpen={setListModalOpen}
        createList={createList}
        deleteList={deleteList}
        friends={friends}
      />
    </div>
  );
}

/* ================= LAYOUT ================= */

function ProfileLayout({
  user,
  lists,
  isOwn,
  listModalOpen,
  setListModalOpen,
  createList,
  deleteList,
  friends,
}: {
  user: User;
  lists: List[];
  isOwn: boolean;
  listModalOpen: boolean;
  setListModalOpen: (open: boolean) => void;
  createList: (uid: number, name: string, description: string) => Promise<void>;
  deleteList: (listid: number) => Promise<void>;
  friends: number[] | null;
}) {
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [listIdToDelete, setListIdToDelete] = useState<number | null>(null);

  return (
    <>
      {/* BODY */}
      <div className="w-full bg-linear-to-br from-(--local-green-light)/80 to-(--local-green-dark) text-white">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col lg:flex-row items-center lg:items-end gap-8">
          <div className="w-50 h-50 rounded-full overflow-hidden border-4 border-(--local-green-dark) shadow-2xl bg-white flex items-center justify-center">
            {user.profile_image ? (
              <img
                src={user.profile_image}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserRound size={100} strokeWidth={1.2} />
            )}
          </div>

          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-bold flex gap-2">
              {user.fullname} {isOwn && <span className="text-sm">(ME!)</span>}
            </h1>
            <p className="text-lg opacity-90">@{user.username}</p>
            {isOwn && (
              <a
                href="/profile/edit"
                className="text-white text-xs hover:underline"
              >
                Edit Profile
              </a>
            )}

            <div className="flex gap-4 mt-2">
              <Stat label="Friends" value={friends?.length ?? 0} />
              <Stat label="Lists" value={lists.length} />
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="bg-white rounded-2xl border shadow-sm p-6 h-fit">
          <h2 className="text-2xl font-bold text-(--local-green-dark)">
            About
          </h2>

          <div className="flex items-center gap-3 mt-4 text-gray-700">
            <Users size={20} />
            <p>
              {friends?.length ?? 0} Friend{friends?.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4 text-gray-700">
            <CalendarDays size={20} />
            <p>Joined {new Date(user.created).toDateString()}</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-2 bg-white rounded-2xl border shadow-sm p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-(--local-green-dark)">
              {isOwn ? "Your Lists" : "Lists"}
            </h2>

            <div className="flex items-center justify-center w-fit gap-4">
              <p className="text-sm text-gray-500">{lists.length} total</p>
              {isOwn && (
                <button
                  onClick={() => setListModalOpen(true)}
                  className="flex items-center gap-1 text-sm px-3 py-1 rounded bg-(--local-green) text-white hover:bg-(--local-green-light) cursor-pointer transition-all duration-300 hover:scale-105"
                >
                  <Plus size={14} />
                  New List
                </button>
              )}
            </div>
          </div>

          {lists.length === 0 ? (
            <p className="text-gray-500">No lists yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lists.map((list) => (
                <div
                  key={list.listid}
                  className="border rounded-2xl p-5 relative"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-lg">{list.name}</h3>
                    {isOwn && (
                      <button
                        onClick={() => {
                          setListIdToDelete(list.listid);
                          setConfirmDelete(true);
                        }}
                      >
                        <Trash2
                          size={16}
                          color="red"
                          className="hover:scale-125 transition-transform cursor-pointer"
                        />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mt-1">
                    {list.description || "No description"}
                  </p>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users size={16} />
                      <p>{list.members?.length ?? 0} members</p>
                    </div>
                    <a
                      href={`/list/${list.listid}`}
                      className="text-sm text-white bg-(--local-green) px-3 py-1 rounded hover:bg-(--local-green-light) transition-all duration-300 hover:scale-105"
                    >
                      Open List
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <CreateListModal
        showModal={listModalOpen}
        setListModalOpen={setListModalOpen}
        createList={createList}
      />
      <ConfirmDeleteModal
        confirmDelete={confirmDelete}
        setConfirmDelete={setConfirmDelete}
        onConfirm={() => {
          if (listIdToDelete !== null) {
            deleteList(listIdToDelete);
            setListIdToDelete(null);
          }
        }}
      />
    </>
  );

  /* ========== DELETE LIST MODAL ========== */
  function ConfirmDeleteModal({
    confirmDelete,
    setConfirmDelete,
    onConfirm,
  }: {
    confirmDelete: boolean;
    setConfirmDelete: (open: boolean) => void;
    onConfirm: () => void;
  }) {
    return (
      <AnimatePresence mode="wait">
        {confirmDelete && (
          <>
            {/* BACKDROP */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* MODAL */}
            <motion.div
              initial={{ opacity: 0, y: -60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{
                duration: 0.25,
                ease: "easeOut",
              }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border">
                <h2 className="text-2xl font-bold text-(--local-green-dark)">
                  Confirm Delete
                </h2>

                <p className="text-gray-600 mt-2 leading-relaxed">
                  Are you sure you want to delete this list? This action cannot
                  be undone.
                </p>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-4 py-2 rounded-lg border hover:bg-neutral-100 cursor-pointer transition-all duration-300"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => {
                      setConfirmDelete(false);
                      onConfirm();
                    }}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 hover:scale-105 cursor-pointer transition-all duration-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  /* ================= STAT ================= */
  function Stat({ label, value }: { label: string; value: number }) {
    return (
      <div className="bg-white/10 px-4 py-2 rounded-xl min-w-20 flex flex-col items-center justify-center">
        <p className="text-sm opacity-80">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    );
  }

  /* ========== CREATE LIST MODAL ========== */
  function CreateListModal({
    showModal,
    setListModalOpen,
    createList,
  }: {
    showModal: boolean;
    setListModalOpen: (open: boolean) => void;
    createList: (
      uid: number,
      name: string,
      description: string,
    ) => Promise<void>;
  }) {
    const [name, setName] = useState<string | null>(null);
    const [description, setDescription] = useState<string | null>(null);
    const createIsDisabled = name === null || name.trim() === "";

    const ctx = useContext(AuthContext);

    if (!ctx || !ctx.user) return null;

    return (
      <AnimatePresence mode="wait">
        {showModal && (
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: -100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 0.5 }}
              className="fixed inset-0 flex items-center justify-center p-4 z-50"
            >
              <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold text-(--local-green-dark)">
                  Create List
                </h2>
                <p className="text-gray-600 mt-2">
                  Enter a name, and an optional description for your new list.
                </p>
                <div className="flex flex-col mt-4">
                  <input
                    type="text"
                    placeholder="List name"
                    value={name || ""}
                    onChange={(e) => setName(e.target.value)}
                    className="border rounded-lg p-2 mt-4 focus:outline-none focus:ring-2 focus:ring-(--local-green)"
                  />
                  <textarea
                    placeholder="Description (optional)"
                    value={description || ""}
                    onChange={(e) => setDescription(e.target.value)}
                    className="border rounded-lg p-2 mt-4 focus:outline-none focus:ring-2 focus:ring-(--local-green) resize-y max-h-30:"
                    rows={4}
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    className="px-4 py-2 rounded-lg border hover:bg-neutral-300 cursor-pointer transition-all duration-300"
                    onClick={() => setListModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!name) {
                        alert("List name is required");
                        return;
                      }
                      if (!ctx?.user) return;
                      createList(ctx.user.uid, name, description || "")
                        .then(() => {
                          setListModalOpen(false);
                          setName(null);
                          setDescription(null);
                        })
                        .catch((err) => {
                          alert(
                            err instanceof Error
                              ? err.message
                              : "Failed to create list",
                          );
                        });
                    }}
                    className="px-4 py-2 rounded-lg bg-(--local-green) text-white hover:bg-(--local-green-light) hover:scale-105 cursor-pointer transition-all duration-300 disabled:opacity-20 disabled:scale-100 disabled:cursor-not-allowed disabled:hover:bg-(--local-green)"
                    disabled={createIsDisabled}
                  >
                    Create
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }
}
