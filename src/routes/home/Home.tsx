import { useContext, useEffect, useMemo, /* useRef, */ useState } from "react";
import Header from "../../components/header/Header";
import AuthContext from "../../utils/contexts/sessions/AuthContext";
import MyError from "../../components/error/Error";
import shorthandDateMonthToLong from "../../utils/helpers/DateTime";
import { PlusCircle, Pencil, Trash2, CircleUserRound } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
//import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";

/* ================= TYPES ================= */

type EventType = {
  id: string;
  uid: number | null; // owner (null = global event)
  name: string;
  date: string; // DD-MM-YYYY
  editable: boolean; // user-owned
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

/* ================= MAIN ================= */

export default function Home() {
  const auth = useContext(AuthContext);

  const [events, setEvents] = useState<EventType[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [lists, setLists] = useState<List[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<EventType | null>(null);

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    if (!auth?.user) return;

    const uid = auth.user.uid;

    // GLOBAL + USER EVENTS
    fetch(`http://localhost:9003/api/events/${uid}`)
      .then((r) => r.json())
      .then((d) => setEvents(d.events || []));

    // FRIENDS
    fetch(`http://localhost:9003/api/friends/${uid}`)
      .then((r) => r.json())
      .then((d) => setFriends(d.friends || []));

    // LISTS
    fetch(`http://localhost:9003/api/lists/${uid}`)
      .then((r) => r.json())
      .then((d) => setLists(d.lists || []));
  }, [auth?.user]);

  /* ================= GROUP EVENTS ================= */

  const groupedEvents = useMemo(() => {
    const groups: Record<string, EventType[]> = {};

    events.forEach((e) => {
      if (!groups[e.date]) groups[e.date] = [];
      groups[e.date].push(e);
    });

    return Object.entries(groups);
  }, [events]);

  const closeFriends = friends.filter((f) => f.close);

  /* ================= AUTH GUARD ================= */

  if (!auth) {
    return (
      <MyError
        ErrorCode={1002}
        ErrorMessage="Auth context failed to initialise"
      />
    );
  }

  if (!auth.isLoggedIn || !auth.user) {
    return <MyError ErrorCode={1001} ErrorMessage="User not authenticated" />;
  }

  const user = auth.user;

  /* ================= EVENT CRUD ================= */

  async function saveEvent(name: string, date: string, id?: string) {
    const isEdit = !!id;

    const res = await fetch("http://localhost:9003/api/events", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        uid: user.uid,
        name,
        date,
        editable: true,
      }),
    });

    const data = await res.json();
    if (!data.success) return;

    if (isEdit) {
      setEvents((prev) => prev.map((e) => (e.id === id ? data.event : e)));
    } else {
      setEvents((prev) => [...prev, data.event]);
    }
  }

  async function deleteEvent(id: string) {
    await fetch(`http://localhost:9003/api/events/${id}`, {
      method: "DELETE",
    });

    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  /* ================= UI ================= */

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <Header />

      <div className="flex flex-col flex-1 px-6 py-6 gap-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
          {/* EVENTS */}
          <div className="bg-white rounded-2xl shadow border flex flex-col">
            <div className="flex justify-between p-4">
              <h2 className="font-bold">Upcoming Events</h2>
              <PlusCircle
                className="cursor-pointer"
                onClick={() => {
                  setEditing(null);
                  setShowModal(true);
                }}
              />
            </div>

            <div className="overflow-y-auto px-4 pb-4">
              {groupedEvents.map(([date, items]) => (
                <div key={date} className="mb-4">
                  <p className="font-bold text-sm mb-2">
                    {shorthandDateMonthToLong(date)}
                  </p>

                  {items.map((e) => (
                    <div
                      key={e.id}
                      className="flex justify-between p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <p>{e.name}</p>

                      {e.editable && (
                        <div className="flex gap-2">
                          <Pencil
                            size={16}
                            className="cursor-pointer"
                            onClick={() => {
                              setEditing(e);
                              setShowModal(true);
                            }}
                          />
                          <Trash2
                            size={16}
                            className="text-red-500 cursor-pointer"
                            onClick={() => deleteEvent(e.id)}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* FRIENDS */}
          <div className="lg:col-span-2 grid gap-4">
            <Panel title="Close Friends">
              {closeFriends.map((f) => (
                <FriendItem key={f.username} friend={f} />
              ))}
            </Panel>

            <Panel title="All Friends">
              {friends.map((f) => (
                <FriendItem key={f.username} friend={f} />
              ))}
            </Panel>

            <Panel title="My Lists">
              {lists.map((l) => (
                <div key={l.id} className="p-2 hover:bg-gray-100 rounded-lg">
                  {l.name}
                </div>
              ))}
            </Panel>
          </div>
        </div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {showModal && (
          <EventModal
            editing={editing}
            onClose={() => setShowModal(false)}
            onSave={saveEvent}
          />
        )}
      </AnimatePresence>
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

/* ================= MODAL ================= */

function EventModal({
  editing,
  onClose,
  onSave,
}: {
  editing: EventType | null;
  onClose: () => void;
  onSave: (name: string, date: string, id?: string) => void;
}) {
  const [name, setName] = useState(editing?.name || "");
  const [date, setDate] = useState("");

  function formatDate(value: string) {
    const [y, m, d] = value.split("-");
    return `${d}-${m}-${y}`;
  }

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
          <h2 className="font-bold text-xl">
            {editing ? "Edit Event" : "Add Event"}
          </h2>

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
              className="bg-green-600 text-white px-4 py-2 rounded"
              onClick={() => onSave(name, formatDate(date), editing?.id)}
            >
              Save
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
