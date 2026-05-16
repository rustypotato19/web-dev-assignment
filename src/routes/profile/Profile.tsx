import Header from "../../components/header/Header";
import AuthContext from "../../utils/contexts/sessions/AuthContext";
import MyError, { ContextInitError } from "../../components/error/Error";
import { useNavigate, useParams } from "react-router";
import { CalendarDays, Users, UserRound, Plus, Trash2 } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { List, User } from "../../utils/types/Types";
import { fetchUidByUsername, fetchUserByUsername } from "../../utils/db/Db";
import useWindowDimensions from "../../utils/helpers/WindowSize";

/* ================= MAIN ================= */

export default function Profile() {
  const ctx = useContext(AuthContext);
  const { username: paramUsername } = useParams();
  const navigate = useNavigate();

  const { width } = useWindowDimensions();
  const isMobile = width < 640;

  const isOwnProfile =
    !paramUsername ||
    (ctx?.user?.username && paramUsername === ctx.user.username);

  const username = paramUsername || ctx?.user?.username || "";

  const [user, setUser] = useState<User | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [friends, setFriends] = useState<number[]>([]);

  const [listModalOpen, setListModalOpen] = useState(false);

  async function createList(uid: number, name: string, description: string) {
    if (!ctx || !uid || !name) return;

    const res = await fetch(
      `https://webdev.aboutkonrad.com/api/lists/create/${encodeURIComponent(uid)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      },
    );

    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to create list");

    const listId = data.list.listid;

    setLists((prev) => [
      ...prev,
      {
        listid: listId,
        name,
        description,
        members: [],
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      },
    ]);

    setTimeout(() => navigate(`/list/${listId}`), 800);
  }

  async function deleteList(listid: number) {
    if (!ctx) return;

    const res = await fetch(
      `https://webdev.aboutkonrad.com/api/lists/delete/${listid}`,
      { method: "DELETE" },
    );

    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Delete failed");

    setLists((prev) => prev.filter((l) => l.listid !== listid));
  }

  useEffect(() => {
    async function load() {
      if (!username) return;

      try {
        setLoading(true);

        if (ctx?.user && username === ctx.user.username) {
          setUser(ctx.user);
          setLoading(false);
          return;
        }

        const fetchedUser = await fetchUserByUsername(username);
        setUser(fetchedUser);

        console.log("Image URL:", fetchedUser.profile_image);

        const listRes = await fetch(
          `https://webdev.aboutkonrad.com/api/lists/user/${fetchedUser.uid}`,
        );
        const listData = await listRes.json();
        setLists(listData || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [ctx?.user, username]);

  useEffect(() => {
    async function loadFriends() {
      if (!username) return;

      try {
        let id = user?.uid;
        if (!id) id = await fetchUidByUsername(username);

        const res = await fetch(
          `https://webdev.aboutkonrad.com/api/friends/${id}`,
        );
        const data = await res.json();
        setFriends(data.friends || []);
      } catch {
        setFriends([]);
      }
    }

    loadFriends();
  }, [user, username]);

  if (!ctx) return <ContextInitError />;
  if (!username)
    return <MyError ErrorCode={404} ErrorMessage="Username not found." />;
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-sm md:text-base">
        Loading profile...
      </div>
    );
  if (error || !user)
    return <MyError ErrorCode={404} ErrorMessage={error || "User not found"} />;

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
        isMobile={isMobile}
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
  isMobile,
}: {
  user: User;
  lists: List[];
  isOwn: boolean;
  listModalOpen: boolean;
  setListModalOpen: (b: boolean) => void;
  createList: (uid: number, name: string, desc: string) => Promise<void>;
  deleteList: (id: number) => Promise<void>;
  friends: number[];
  isMobile: boolean;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [listIdToDelete, setListIdToDelete] = useState<number | null>(null);

  return (
    <>
      {/* HERO */}
      <div className="w-full bg-linear-to-br from-(--local-green-light)/80 to-(--local-green-dark) text-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 text-center md:text-left">
          <div className="w-28 h-28 md:w-52 md:h-52 rounded-full overflow-hidden border-4 border-(--local-green-dark) bg-white flex items-center justify-center">
            {user.profile_image && user.profile_image.trim() !== "" ? (
              <img
                src={user.profile_image}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserRound
                size={isMobile ? 80 : 120}
                color="black"
                strokeWidth={0.8}
              />
            )}
          </div>

          <div className="flex flex-col gap-2 md:gap-3">
            <h1 className="text-2xl md:text-4xl font-bold">
              {user.fullname} {isOwn && <span className="text-xs">(ME)</span>}
            </h1>

            <p className="text-sm md:text-lg opacity-90">@{user.username}</p>

            <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4 mt-2">
              <Stat label="Friends" value={friends.length} />
              <Stat label="Lists" value={lists.length} />
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* LEFT */}
        <div className="bg-white rounded-2xl border shadow-sm p-4 md:p-6">
          <h2 className="text-xl md:text-2xl font-bold text-(--local-green-dark)">
            About
          </h2>

          <div className="flex items-center gap-2 mt-4 text-gray-700 text-sm md:text-base">
            <Users size={18} />
            <p>{friends.length} Friends</p>
          </div>

          <div className="flex items-center gap-2 mt-3 text-gray-700 text-sm md:text-base">
            <CalendarDays size={18} />
            <p>Joined {new Date(user.created).toDateString()}</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-2 bg-white rounded-2xl border shadow-sm p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:items-center mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-(--local-green-dark)">
              {isOwn ? "Your Lists" : "Lists"}
            </h2>

            {isOwn && (
              <button
                onClick={() => setListModalOpen(true)}
                className="flex items-center justify-center gap-1 text-sm px-3 py-1 rounded bg-(--local-green) text-white"
              >
                <Plus size={14} />
                New List
              </button>
            )}
          </div>

          {lists.length === 0 ? (
            <p className="text-gray-500 text-sm">No lists yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {lists.map((list) => (
                <div
                  key={list.listid}
                  className="border rounded-2xl p-4 md:p-5"
                >
                  <div className="flex justify-between">
                    <h3 className="font-bold text-base md:text-lg">
                      {list.name}
                    </h3>

                    {isOwn && (
                      <button
                        onClick={() => {
                          setListIdToDelete(list.listid);
                          setConfirmDelete(true);
                        }}
                      >
                        <Trash2 size={16} color="red" />
                      </button>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mt-1">
                    {list.description || "No description"}
                  </p>

                  <a
                    href={`/list/${list.listid}`}
                    className="inline-block mt-3 text-xs md:text-sm bg-(--local-green) text-white px-3 py-1 rounded"
                  >
                    Open List
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence mode="sync">
        <CreateListModal
          show={listModalOpen}
          setOpen={setListModalOpen}
          createList={createList}
        />

        <ConfirmDeleteModal
          open={confirmDelete}
          setOpen={setConfirmDelete}
          onConfirm={() => {
            if (listIdToDelete) deleteList(listIdToDelete);
          }}
        />
      </AnimatePresence>
    </>
  );
}

/* ================= SMALL UI ================= */

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white/20 px-3 py-1 rounded-lg text-center min-w-16">
      <p className="text-xs opacity-80">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}

/* ================= MODALS ================= */

function ConfirmDeleteModal({
  open,
  setOpen,
  onConfirm,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <AnimatePresence mode="sync">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/50 z-40"
      />
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
      >
        <div className="bg-white p-5 rounded-xl w-full max-w-sm">
          <h2 className="font-bold text-lg">Confirm delete</h2>
          <p className="text-sm text-gray-600 mt-2">This cannot be undone.</p>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setOpen(false)}
              className="px-3 py-1 border rounded"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setOpen(false);
                onConfirm();
              }}
              className="px-3 py-1 bg-red-500 text-white rounded"
            >
              Delete
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function CreateListModal({
  show,
  setOpen,
  createList,
}: {
  show: boolean;
  setOpen: (open: boolean) => void;
  createList: (
    userId: number,
    name: string,
    description: string,
  ) => Promise<void>;
}) {
  const ctx = useContext(AuthContext);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  if (!show) return null;

  return (
    <AnimatePresence mode="sync">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/50 z-40"
      />
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
      >
        <div className="bg-white p-5 rounded-xl w-full max-w-md">
          <h2 className="font-bold text-lg">Create list</h2>

          <input
            className="border w-full p-2 mt-3 rounded"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <textarea
            className="border w-full p-2 mt-3 rounded"
            placeholder="Description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />

          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setOpen(false)}>Cancel</button>
            <button
              className="bg-green-600 text-white px-3 py-1 rounded"
              disabled={!name.trim()}
              onClick={() => {
                if (!ctx?.user) return;
                createList(ctx.user.uid, name, desc);
                setOpen(false);
                setName("");
                setDesc("");
              }}
            >
              Create
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
