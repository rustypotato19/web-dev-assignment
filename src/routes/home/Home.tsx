import { useContext, useEffect, useMemo, useState } from "react";
import Header from "../../components/header/Header";
import AuthContext from "../../utils/contexts/sessions/AuthContext";
import MyError from "../../components/error/Error";
import shorthandDateMonthToLong from "../../utils/helpers/DateTime";
import { PlusCircle, CircleUserRound, Trash2, Lock } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

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
  close: boolean;
  img?: string;
  email: string;
};

type List = {
  id: string;
  name: string;
};

type DeleteModalProps = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  itemName?: string;
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

          const userRes = await fetch(
            `http://localhost:9003/api/users/${encodeURIComponent(storedUid)}`,
          );

          const userData = await userRes.json();

          auth.setUser(userData);

          currentUser = userData;
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

        /* ================= FIX: NORMALISE IDS ================= */
        setEvents([
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(userEventsData || []).map((e: any) => ({
            id: e.eventid, // FIX HERE
            uid: e.uid,
            name: e.name,
            date: e.date,
            created: e.created,
            updated: e.updated,
            editable: true,
          })),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(fixedEventsData || []).map((e: any) => ({
            id: e.eventid, // FIX HERE
            name: e.name,
            date: e.date,
            created: e.created,
            updated: e.updated,
            editable: false,
          })),
        ]);

        setFriends(friendsData.friends || []);
        setLists(listsData.lists || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [auth]);

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
    return (
      <MyError
        ErrorCode={1002}
        ErrorMessage="Auth context failed to initialise"
      />
    );
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

  /* ================= DELETE FIX ================= */

  async function deleteEvent(id: string) {
    try {
      await fetch(
        `http://localhost:9003/api/events/user/delete/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        },
      );

      setEvents((prev) => prev.filter((e) => e.id !== id || !e.editable));

      setDeleteModalOpen(false);
      setSelectedDeleteEvent(null);
    } catch (err) {
      console.error(err);
    }
  }

  /* ================= SAVE ================= */

  async function saveEvent(name: string, date: string) {
    const res = await fetch(
      `http://localhost:9003/api/events/user/create/${encodeURIComponent(
        user.uid,
      )}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

    setShowModal(false);
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
                className="w-10 h-10 rounded-full object-cover"
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

              <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
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
              <Panel title="All Friends">
                {friends.length === 0 ? (
                  <p className="text-gray-400 text-sm">
                    You don't have any friends yet {":("}
                  </p>
                ) : (
                  friends.map((f) => <FriendItem key={f.username} friend={f} />)
                )}
              </Panel>

              <Panel title="My Lists">
                {lists.length === 0 ? (
                  <p className="text-gray-400 text-sm">
                    You haven't created any lists yet
                  </p>
                ) : (
                  lists.map((l) => (
                    <div
                      key={l.id}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      {l.name}
                    </div>
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
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow border">
      <div className="p-3 font-semibold">{title}</div>
      <div className="flex gap-3 overflow-x-auto p-3">{children}</div>
    </div>
  );
}

/* ================= FRIEND ================= */

function FriendItem({ friend }: { friend: Friend }) {
  return (
    <div className="flex items-center gap-3 p-2">
      {friend.img ? (
        <img src={friend.img} className="w-10 h-10 rounded-full object-cover" />
      ) : (
        <CircleUserRound className="w-10 h-10 text-gray-400" />
      )}

      <div>
        <p className="text-sm font-medium">{friend.name}</p>
        <p className="text-xs text-gray-400">@{friend.username}</p>
      </div>
    </div>
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
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
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
          />

          <div className="flex justify-end gap-3">
            <button onClick={onClose}>Cancel</button>

            <button
              className="bg-(--local-green) text-white px-4 py-2 rounded"
              onClick={() => onSave(name, date)}
            >
              Save
            </button>
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
          {/* BACKDROP */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />

          {/* MODAL */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
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
