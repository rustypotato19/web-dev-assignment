import { useContext, useEffect, useMemo, useState } from "react";
import Header from "../../components/header/Header";
import AuthContext from "../../utils/contexts/sessions/AuthContext";
import MyError, { ContextInitError } from "../../components/error/Error";
import shorthandDateMonthToLong from "../../utils/helpers/DateTime";
import {
  PlusCircle,
  CircleUserRound,
  Trash2,
  Lock,
  Search,
  UserPlus,
  Check,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { fetchUserByUid } from "../../utils/db/Db";
import type { List } from "../../utils/types/Types";

/* ================= TYPES ================= */

type EventType = {
  id: string;
  uid?: number | null;
  name: string;
  date: string;
  created: string;
  updated: string;
  editable: boolean;
};

type Friend = {
  name: string;
  username: string;
  profile_image?: string;
  email: string;
};

type SearchUser = {
  uid: number;
  username: string;
  fullname: string;
  profile_image?: string;
};

type DeleteModalProps = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  itemName?: string;
};

type ApiEvent = {
  eventid: string;
  uid?: number;
  name: string;
  date: string;
  created: string;
  updated: string;
};

/* ================= MAIN ================= */

export default function Home() {
  const auth = useContext(AuthContext);

  const [events, setEvents] = useState<EventType[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [lists, setLists] = useState<List[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDeleteEvent, setSelectedDeleteEvent] =
    useState<EventType | null>(null);

  /* ================= FRIEND SEARCH ================= */

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [addingFriend, setAddingFriend] = useState<number | null>(null);
  const [addedFriends, setAddedFriends] = useState<number[]>([]);

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    async function init() {
      try {
        if (!auth) return;

        let currentUser = auth.user;

        if (!currentUser) {
          const storedUid = localStorage.getItem("uid");

          if (!storedUid || storedUid === "undefined") {
            setLoading(false);
            return;
          }

          const fetchedUser = await fetchUserByUid(Number(storedUid));

          auth.setUser(fetchedUser);

          currentUser = fetchedUser;
        }

        if (!currentUser) return;

        const uid = currentUser.uid;

        const [userEventsRes, fixedEventsRes, friendsRes, listsRes] =
          await Promise.all([
            fetch(
              `http://localhost:9003/api/events/user/${encodeURIComponent(uid)}`,
            ),
            fetch(`http://localhost:9003/api/events/fixed`),
            fetch(
              `http://localhost:9003/api/friends/${encodeURIComponent(uid)}`,
            ),
            fetch(
              `http://localhost:9003/api/lists/user/${encodeURIComponent(uid)}`,
            ),
          ]);

        const userEventsData = await userEventsRes.json();
        const fixedEventsData = await fixedEventsRes.json();
        const friendsData = await friendsRes.json();
        const listsData = await listsRes.json();

        setEvents([
          ...(userEventsData || []).map((e: ApiEvent) => ({
            id: e.eventid,
            uid: e.uid,
            name: e.name,
            date: e.date,
            created: e.created,
            updated: e.updated,
            editable: true,
          })),

          ...(fixedEventsData || []).map((e: ApiEvent) => ({
            id: e.eventid,
            name: e.name,
            date: e.date,
            created: e.created,
            updated: e.updated,
            editable: false,
          })),
        ]);

        // strip past events from events list
        setEvents((prev) =>
          prev.filter((e) => new Date(e.date).getTime() >= Date.now()),
        );

        setFriends(friendsData.friends || []);
        setLists(listsData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [auth]);

  /* ================= USER SEARCH ================= */

  useEffect(() => {
    async function searchUsers() {
      if (!search.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        setSearchLoading(true);

        const res = await fetch(
          `http://localhost:9003/api/users/search/${encodeURIComponent(
            search,
          )}`,
        );

        const data = await res.json();

        setSearchResults(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setSearchLoading(false);
      }
    }

    const timeout = setTimeout(() => {
      searchUsers();
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  /* ================= GROUP EVENTS ================= */

  const groupedEvents = useMemo(() => {
    const groups: Record<string, EventType[]> = {};

    events.forEach((e) => {
      if (!e) return;

      if (!groups[e.date]) groups[e.date] = [];
      groups[e.date].push(e);
    });

    return Object.entries(groups);
  }, [events]);

  /* ================= AUTH ================= */

  if (!auth) {
    return <ContextInitError />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-medium">
        Loading...
      </div>
    );
  }

  if (!auth.isLoggedIn || !auth.user) {
    return <MyError ErrorCode={1001} ErrorMessage="User not authenticated" />;
  }

  const user = auth.user;

  /* ================= DELETE EVENT ================= */

  async function deleteEvent(id: string) {
    try {
      await fetch(
        `http://localhost:9003/api/events/user/delete/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        },
      );

      setEvents((prev) => prev.filter((e) => e.id !== id || !e.editable));

      // strip past events from events list
      setEvents((prev) =>
        prev.filter((e) => new Date(e.date).getTime() >= Date.now()),
      );

      setDeleteModalOpen(false);
      setSelectedDeleteEvent(null);
    } catch (err) {
      console.error(err);
    }
  }

  /* ================= SAVE EVENT ================= */

  async function saveEvent(name: string, date: string) {
    const res = await fetch(
      `http://localhost:9003/api/events/user/create/${encodeURIComponent(
        user.uid,
      )}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, date }),
      },
    );

    const data = await res.json();

    if (!data.eventid) return;

    setEvents((prev) => [
      ...prev,
      {
        id: data.eventid,
        name: data.name,
        date: data.date,
        created: data.created,
        updated: data.updated,
        uid: data.uid,
        editable: true,
      },
    ]);

    // Order events by date after adding new event
    setEvents((prev) =>
      [...prev].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
    );

    // strip past events from ordered events list
    setEvents((prev) =>
      prev.filter((e) => new Date(e.date).getTime() >= Date.now()),
    );

    setShowModal(false);
  }

  /* ================= ADD FRIEND ================= */

  async function addFriend(friendUid: number) {
    try {
      setAddingFriend(friendUid);

      const res = await fetch(`http://localhost:9003/api/friends/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_uid: user.uid,
          friend_uid: friendUid,
        }),
      });

      const data = await res.json();

      if (!data.success) return;

      setAddedFriends((prev) => [...prev, friendUid]);

      // Optimistically fetch the friend's data and add them to the friends list immediately
      const newFriendData = await fetchUserByUid(friendUid);
      setFriends((prev) => [
        ...prev,
        {
          name: newFriendData.fullname,
          username: newFriendData.username,
          profile_image: newFriendData.profile_image,
          email: newFriendData.email,
        } as Friend,
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingFriend(null);
    }
  }

  /* ================= UI ================= */

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <Header />

      <div className="flex-1 min-h-0 px-6 py-6">
        <div className="flex flex-col h-full gap-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 shrink-0">
            {user.profile_image ? (
              <img
                src={user.profile_image}
                className="w-16 h-16 rounded-full object-cover border border-(--local-green-dark)"
              />
            ) : (
              <CircleUserRound className="w-10 h-10 text-gray-400" />
            )}

            <h1 className="text-3xl font-bold">Welcome, {user.username}</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
            {/* EVENTS */}
            <div className="bg-white rounded-2xl shadow border flex flex-col min-h-0">
              <div className="flex justify-between p-4 shrink-0">
                <h2 className="font-bold">Upcoming Events</h2>

                <PlusCircle
                  className="cursor-pointer"
                  onClick={() => setShowModal(true)}
                />
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 mb-2">
                {groupedEvents.length === 0 ? (
                  <p className="text-gray-400 text-sm">No items to show</p>
                ) : (
                  groupedEvents.map(([date, items]) => (
                    <div key={date} className="mb-4">
                      <div className="flex items-center justify-center">
                        <p className="font-bold">
                          {shorthandDateMonthToLong(date)}
                        </p>

                        <div className="flex-1 h-0.75 ml-3 bg-black/40 rounded-full" />
                      </div>

                      {items.map((e) => (
                        <div
                          key={e.id}
                          className="flex justify-between items-center px-2 py-0.5 hover:bg-gray-100 rounded-lg"
                        >
                          <p>{e.name}</p>

                          {e.editable ? (
                            <Trash2
                              size={16}
                              className="text-red-500 cursor-pointer"
                              onClick={() => {
                                setSelectedDeleteEvent(e);
                                setDeleteModalOpen(true);
                              }}
                            />
                          ) : (
                            <Lock size={16} className="text-gray-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="lg:col-span-2 grid gap-4 content-start overflow-y-auto min-h-0">
              {/* SEARCH USERS */}
              <div className="bg-white rounded-2xl shadow border">
                <div className="p-4 border-b">
                  <h2 className="font-bold text-lg">Add Friends</h2>

                  <div className="relative mt-3">
                    <Search
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by username..."
                      className="w-full border rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-(--local-green-light)"
                    />
                  </div>
                </div>

                <div className="flex flex-col pt-3 px-3 mb-5 gap-2 min-h-fit max-h-80 overflow-y-auto">
                  {search === "" ? (
                    <p className="text-sm text-gray-400 my-auto">
                      Search results will show here
                    </p>
                  ) : searchLoading ? (
                    <p className="text-sm text-gray-400">Searching...</p>
                  ) : search.trim() && searchResults.length === 0 ? (
                    <p className="text-sm text-gray-400">No users found</p>
                  ) : (
                    searchResults
                      .filter((u) => u.uid !== user.uid)
                      .map((u) => {
                        const alreadyFriend =
                          friends.some((f) => f.username === u.username) ||
                          addedFriends.includes(u.uid);

                        return (
                          <div
                            key={u.uid}
                            className="flex items-center justify-between border rounded-xl p-3 hover:bg-gray-50 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              {u.profile_image ? (
                                <img
                                  src={u.profile_image}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <CircleUserRound className="w-12 h-12 text-gray-400" />
                              )}

                              <div>
                                <p className="font-semibold">{u.fullname}</p>

                                <p className="text-sm text-gray-500">
                                  @{u.username}
                                </p>
                              </div>
                            </div>

                            {alreadyFriend ? (
                              <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                                <Check size={18} />
                                Added
                              </div>
                            ) : (
                              <button
                                onClick={() => addFriend(u.uid)}
                                disabled={addingFriend === u.uid}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-(--local-green) text-white hover:bg-(--local-green-light) transition-all cursor-pointer disabled:opacity-50"
                              >
                                <UserPlus size={16} />
                                Add Friend
                              </button>
                            )}
                          </div>
                        );
                      })
                  )}
                </div>
              </div>

              {/* FRIENDS */}
              <Panel title="All Friends">
                {friends.length === 0 ? (
                  <p className="text-gray-400 text-sm">
                    You don't have any friends yet {":("}
                  </p>
                ) : (
                  friends.map((f) => <FriendItem key={f.username} friend={f} />)
                )}
              </Panel>

              {/* LISTS */}
              <Panel title="My Lists" link="/lists">
                {lists.length === 0 ? (
                  <p className="text-gray-400 text-sm">
                    You haven't created any lists yet
                  </p>
                ) : (
                  lists.map((l) => (
                    <a
                      href={`/list/${l.listid}`}
                      key={l.listid}
                      className="flex flex-col gap-1 p-2 border rounded-lg hover:bg-neutral-200 cursor-pointer transition"
                    >
                      <p className="font-medium">{l.name}</p>

                      <p className="text-sm text-gray-400">
                        {l.description || "No description provided"}
                      </p>
                    </a>
                  ))
                )}
              </Panel>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {showModal && (
          <EventModal onClose={() => setShowModal(false)} onSave={saveEvent} />
        )}
      </AnimatePresence>

      <DeleteConfirmModal
        open={deleteModalOpen}
        itemName={selectedDeleteEvent?.name}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedDeleteEvent(null);
        }}
        onConfirm={() => {
          if (!selectedDeleteEvent) return;

          deleteEvent(selectedDeleteEvent.id);
        }}
      />
    </div>
  );
}

/* ================= PANEL ================= */

function Panel({
  title,
  children,
  link,
}: {
  title: string;
  children: React.ReactNode;
  link?: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow border">
      <a href={link || ""} className="p-3 font-semibold">
        {title}
      </a>

      <div className="flex gap-3 overflow-x-auto p-3">{children}</div>
    </div>
  );
}

/* ================= FRIEND ================= */

function FriendItem({ friend }: { friend: Friend }) {
  return (
    <a
      href={`/profile/${friend.username}`}
      className="flex items-center gap-3 p-2 hover:bg-neutral-200 cursor-pointer transition rounded-lg"
    >
      {friend.profile_image ? (
        <img
          src={friend.profile_image}
          className="w-10 h-10 rounded-full object-cover border border-(--local-green-dark)"
        />
      ) : (
        <CircleUserRound className="w-10 h-10 text-gray-400" />
      )}

      <div>
        <p className="text-sm font-medium">{friend.name}</p>

        <p className="text-xs text-gray-400">@{friend.username}</p>
      </div>
    </a>
  );
}

/* ================= EVENT MODAL ================= */

function EventModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (name: string, date: string) => void;
}) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/40 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="fixed inset-0 flex items-center justify-center z-50"
        initial={{ opacity: 0, y: -20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.8 }}
      >
        <div
          className="bg-white p-6 rounded-2xl shadow w-full max-w-sm flex flex-col gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="font-bold text-xl">Add Event</h2>

          <input
            className="border p-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Event name"
          />
          <input
            type="date"
            className="border p-2 rounded"
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
          />

          <div className="flex justify-between items-center gap-3">
            <p className="text-xs text-red-500">
              {date <= new Date().toISOString().split("T")[0]
                ? "Please select a future date."
                : ""}
            </p>
            <div className="flex gap-3">
              <button
                className="px-4 py-2 rounded cursor-pointer hover:bg-neutral-300 transition-all"
                onClick={onClose}
              >
                Cancel
              </button>

              <button
                className="bg-(--local-green) text-white px-4 py-2 rounded cursor-pointer hover:bg-(--local-green-light) transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium hover:scale-105 disabled:hover:scale-100 disabled:hover:bg-(--local-green)"
                onClick={() => onSave(name, date)}
                disabled={
                  !name.trim() ||
                  !date ||
                  date <= new Date().toISOString().split("T")[0]
                }
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ================= CONFIRM DELETION MODAL ================= */

function DeleteConfirmModal({
  open,
  onCancel,
  onConfirm,
  itemName,
}: DeleteModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />

          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50"
            initial={{
              opacity: 0,
              scale: 0.8,
              y: -20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.8,
              y: 20,
            }}
          >
            <div
              className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm flex flex-col gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold">Delete event?</h2>

              <p className="text-sm text-gray-600">
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                  {itemName ? `"${itemName}"` : "this event"}
                </span>
                ? This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={onCancel}
                  className="px-3 py-1 rounded hover:bg-neutral-300 transition cursor-pointer font-medium"
                >
                  Cancel
                </button>

                <button
                  onClick={onConfirm}
                  className="px-3 py-1 rounded bg-red-700 text-white hover:bg-red-500 active:bg-red-800 transition cursor-pointer font-medium hover:scale-105"
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
