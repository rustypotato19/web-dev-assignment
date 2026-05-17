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
import { useNavigate } from "react-router";

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
              `https://webdev.aboutkonrad.com/api/events/user/${encodeURIComponent(uid)}`,
            ),
            fetch(`https://webdev.aboutkonrad.com/api/events/fixed`),
            fetch(
              `https://webdev.aboutkonrad.com/api/friends/${encodeURIComponent(uid)}`,
            ),
            fetch(
              `https://webdev.aboutkonrad.com/api/lists/user/${encodeURIComponent(uid)}`,
            ),
          ]);

        const userEventsData = await userEventsRes.json();
        const fixedEventsData = await fixedEventsRes.json();
        const friendsData = await friendsRes.json();
        const listsData = await listsRes.json();

        const mergedEvents = [
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
        ]
          .filter((e) => new Date(e.date).getTime() >= Date.now())
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          );

        setEvents(mergedEvents);

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
          `https://webdev.aboutkonrad.com/api/users/search/${encodeURIComponent(
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
      <div className="flex items-center justify-center min-h-screen text-lg font-medium">
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
        `https://webdev.aboutkonrad.com/api/events/user/delete/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        },
      );

      setEvents((prev) =>
        prev.filter(
          (e) =>
            (e.id !== id || !e.editable) &&
            new Date(e.date).getTime() >= Date.now(),
        ),
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
      `https://webdev.aboutkonrad.com/api/events/user/create/${encodeURIComponent(
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

    setEvents((prev) =>
      [
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
      ]
        .filter((e) => new Date(e.date).getTime() >= Date.now())
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        ),
    );

    setShowModal(false);
  }

  /* ================= ADD FRIEND ================= */

  async function addFriend(friendUid: number) {
    try {
      setAddingFriend(friendUid);

      const res = await fetch(
        `https://webdev.aboutkonrad.com/api/friends/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_uid: user.uid,
            friend_uid: friendUid,
          }),
        },
      );

      const data = await res.json();

      if (!data.success) return;

      setAddedFriends((prev) => [...prev, friendUid]);

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
    <div className="flex flex-col min-h-screen bg-gray-50 overflow-x-hidden">
      <Header />

      <div className="flex-1 w-full px-3 sm:px-4 md:px-6 py-4 md:py-6">
        <div className="flex flex-col gap-4 md:gap-6 max-w-425 mx-auto">
          {/* WELCOME */}
          <div className="flex items-center gap-3 md:gap-4 shrink-0 min-w-0">
            {user.profile_image ? (
              <img
                src={user.profile_image}
                className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full object-cover border border-(--local-green-dark) shrink-0"
              />
            ) : (
              <CircleUserRound className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-gray-400 shrink-0" />
            )}

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">
              Welcome, {user.username}
            </h1>
          </div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 xl:grid-cols-[380px_minmax(0,1fr)] gap-4 lg:gap-6 min-h-0">
            {/* EVENTS */}
            <div className="bg-white rounded-2xl shadow border flex flex-col min-h-80 xl:max-h-[calc(100vh-170px)]">
              <div className="flex justify-between items-center p-4 shrink-0 border-b">
                <h2 className="font-bold text-base sm:text-lg">
                  Upcoming Events
                </h2>

                <PlusCircle
                  className="cursor-pointer shrink-0 hover:scale-110 transition"
                  onClick={() => setShowModal(true)}
                />
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-3">
                {groupedEvents.length === 0 ? (
                  <p className="text-gray-400 text-sm">No items to show</p>
                ) : (
                  groupedEvents.map(([date, items]) => (
                    <div key={date} className="mb-5">
                      <div className="flex items-center justify-center mb-2">
                        <p className="font-bold text-sm sm:text-base whitespace-nowrap">
                          {shorthandDateMonthToLong(date)}
                        </p>

                        <div className="flex-1 h-px ml-3 bg-black/20 rounded-full" />
                      </div>

                      <div className="flex flex-col gap-1">
                        {items.map((e) => (
                          <div
                            key={e.id}
                            className="flex justify-between items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg transition"
                          >
                            <p className="text-sm sm:text-base wrap-break-word min-w-0">
                              {e.name}
                            </p>

                            {e.editable ? (
                              <Trash2
                                size={16}
                                className="text-red-500 cursor-pointer shrink-0"
                                onClick={() => {
                                  setSelectedDeleteEvent(e);
                                  setDeleteModalOpen(true);
                                }}
                              />
                            ) : (
                              <Lock
                                size={16}
                                className="text-gray-400 shrink-0"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex flex-col gap-4 lg:gap-6 min-w-0">
              {/* SEARCH USERS */}
              <div className="bg-white rounded-2xl shadow border overflow-hidden">
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
                      className="w-full border rounded-xl pl-10 pr-4 py-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-(--local-green-light)"
                    />
                  </div>
                </div>

                <div className="flex flex-col p-3 gap-2 max-h-105 overflow-y-auto">
                  {search === "" ? (
                    <p className="text-sm text-gray-400 py-6 text-center">
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
                            className="flex items-center justify-between gap-4 border rounded-xl p-3 hover:bg-gray-50 transition-all"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {u.profile_image ? (
                                <img
                                  src={u.profile_image}
                                  className="w-12 h-12 rounded-full object-cover shrink-0"
                                />
                              ) : (
                                <CircleUserRound className="w-12 h-12 text-gray-400 shrink-0" />
                              )}

                              <div className="min-w-0">
                                <p className="font-semibold truncate">
                                  {u.fullname}
                                </p>

                                <p className="text-sm text-gray-500 truncate">
                                  @{u.username}
                                </p>
                              </div>
                            </div>

                            {alreadyFriend ? (
                              <div className="flex items-center gap-2 text-green-600 text-sm font-medium shrink-0">
                                <Check size={18} />
                                Added
                              </div>
                            ) : (
                              <button
                                onClick={() => addFriend(u.uid)}
                                disabled={addingFriend === u.uid}
                                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-(--local-green) text-white hover:bg-(--local-green-light) transition-all cursor-pointer disabled:opacity-50 w-fit sm:w-full shrink-0"
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
                  <p className="text-gray-400 text-sm whitespace-nowrap">
                    You don't have any friends yet {":("}
                  </p>
                ) : (
                  friends.map((f) => <FriendItem key={f.username} friend={f} />)
                )}
              </Panel>

              {/* LISTS */}
              <Panel title="My Lists" link="/lists">
                {lists.length === 0 ? (
                  <p className="text-gray-400 text-sm whitespace-nowrap">
                    You haven't created any lists yet
                  </p>
                ) : (
                  lists.map((l) => (
                    <a
                      href={`/list/${l.listid}`}
                      key={l.listid}
                      className="flex flex-col gap-1 p-3 min-w-60 sm:min-w-65 rounded-lg hover:bg-neutral-200 cursor-pointer transition"
                    >
                      <p className="font-medium wrap-break-word">{l.name}</p>

                      <p className="text-sm text-gray-400 wrap-break-word">
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
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl shadow border overflow-hidden min-w-0">
      <div
        onClick={() => link && navigate(link)}
        className={`p-4 font-semibold text-sm sm:text-base ${
          link &&
          "cursor-pointer hover:bg-neutral-200 transition rounded-tl-2xl rounded-tr-2xl"
        }`}
      >
        {title}
      </div>

      <div className="flex gap-3 overflow-x-auto p-3 min-w-0">{children}</div>
    </div>
  );
}

/* ================= FRIEND ================= */

function FriendItem({ friend }: { friend: Friend }) {
  return (
    <a
      href={`/profile/${friend.username}`}
      className="flex items-center gap-3 sm:p-2 min-w-35 sm:min-w-55 hover:bg-neutral-200 cursor-pointer transition rounded-lg"
    >
      {friend.profile_image ? (
        <img
          src={friend.profile_image}
          className="w-10 h-10 rounded-full object-cover border border-(--local-green-dark) shrink-0"
        />
      ) : (
        <CircleUserRound className="w-10 h-10 text-gray-400 shrink-0" />
      )}

      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{friend.name}</p>

        <p className="text-xs text-gray-400 truncate">@{friend.username}</p>
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
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0, y: -20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.8 }}
      >
        <div
          className="bg-white p-5 sm:p-6 rounded-2xl shadow w-full max-w-md flex flex-col gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="font-bold text-xl">Add Event</h2>

          <input
            className="border p-3 rounded-lg text-sm sm:text-base"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Event name"
          />

          <input
            type="date"
            className="border p-3 rounded-lg text-sm sm:text-base"
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
          />

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <p className="text-xs text-red-500">
              {date <= new Date().toISOString().split("T")[0]
                ? "Please select a future date."
                : ""}
            </p>

            <div className="flex gap-3 justify-end">
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
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
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
              className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 w-full max-w-md flex flex-col gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold">Delete event?</h2>

              <p className="text-sm text-gray-600 wrap-break-word">
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                  {itemName ? `"${itemName}"` : "this event"}
                </span>
                ? This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={onCancel}
                  className="px-3 py-2 rounded hover:bg-neutral-300 transition cursor-pointer font-medium"
                >
                  Cancel
                </button>

                <button
                  onClick={onConfirm}
                  className="px-3 py-2 rounded bg-red-700 text-white hover:bg-red-500 active:bg-red-800 transition cursor-pointer font-medium hover:scale-105"
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
