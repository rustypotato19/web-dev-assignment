import { useContext, useEffect, useMemo, useRef, useState } from "react";
import Header from "../../components/header/Header";
import SessionContext from "../../utils/contexts/sessions/SessionContext";
import MyError from "../error/Error";
import shorthandDateMonthToLong from "../../utils/helpers/DateTime";
import { PlusCircle, Pencil, Trash2, CircleUserRound } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";

/* ================= TYPES ================= */

type EventType = {
  name: string;
  date: string; // DD-MM-YYYY
  editable: boolean;
};

type EditingEvent = {
  id: string;
  data: EventType;
} | null;

type Friend = {
  name: string;
  username: string;
  close: boolean;
  img?: string; // optional profile image
  email: string;
};

/* ================= MAIN ================= */

export default function Home() {
  const ctx = useContext(SessionContext);

  /* ================= STATE ================= */

  const [events, setEvents] = useState<Record<string, EventType>>({
    "1": { name: "My Birthday 🎂", date: "19-05-2025", editable: false },
    "2": { name: "Alex Birthday 🤝", date: "02-06-2025", editable: false },
    "3": { name: "Gym 💪", date: "02-06-2025", editable: true },
    "4": { name: "Meeting 🧠", date: "10-07-2025", editable: false },
    "5": { name: "Holiday ✈️", date: "10-07-2025", editable: false },
  });

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<EditingEvent>(null);

  /* ================= FRIENDS JSON ================= */

  const friends = useMemo<Friend[]>(
    () => [
      {
        name: "Alex Johnson",
        username: "alexj",
        close: true,
        img: "https://i.pravatar.cc/150?img=1",
        email: "alexj@gmail.com",
      },
      {
        name: "Jamie Smith",
        username: "jamie",
        close: true,
        email: "jamie@gmail.com",
      },
      {
        name: "Chris Taylor",
        username: "chris",
        close: true,
        img: "https://i.pravatar.cc/150?img=3",
        email: "chris@gmail.com",
      },
      {
        name: "Taylor Brown",
        username: "taylor",
        close: false,
        email: "taylor@gmail.com",
      },
      {
        name: "Morgan Lee",
        username: "morgan",
        close: false,
        email: "morgan@gmail.com",
      },
      {
        name: "Jordan White",
        username: "jordan",
        close: false,
        img: "https://i.pravatar.cc/150?img=5",
        email: "jordan@gmail.com",
      },
    ],
    [],
  );

  const lists: string[] = ["Birthdays", "Work", "Gym", "Travel Plans"];

  /* ================= DERIVED ================= */

  const closeFriends = useMemo(() => friends.filter((f) => f.close), [friends]);

  const allFriends = useMemo(() => friends, [friends]);

  /* ================= GROUP EVENTS ================= */

  const groupedEvents = useMemo(() => {
    const groups: Record<string, [string, EventType][]> = {};

    Object.entries(events).forEach(([id, event]) => {
      if (!groups[event.date]) groups[event.date] = [];
      groups[event.date].push([id, event]);
    });

    return Object.entries(groups).sort(([a], [b]) => {
      const [d1, m1, y1] = a.split("-").map(Number);
      const [d2, m2, y2] = b.split("-").map(Number);

      if (y1 !== y2) return y1 - y2;
      if (m1 !== m2) return m1 - m2;
      return d1 - d2;
    });
  }, [events]);

  /* ================= CRUD ================= */

  function addEvent(name: string, date: string, editable: boolean) {
    const id = Date.now().toString();
    setEvents((prev) => ({
      ...prev,
      [id]: { name, date, editable },
    }));
  }

  function updateEvent(
    id: string,
    name: string,
    date: string,
    editable: boolean,
  ) {
    setEvents((prev) => ({
      ...prev,
      [id]: { name, date, editable },
    }));
  }

  function deleteEvent(id: string) {
    setEvents((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  }

  /* ================= GUARD ================= */

  if (!ctx) {
    return (
      <MyError
        ErrorCode={1002}
        ErrorMessage="Context failed to initialise. Please try again."
      />
    );
  }

  const username = ctx.username || ctx.email?.split("@")[0];

  /* ================= UI ================= */

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Scrollbar */}
      <style>{`
        .scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #22c55e transparent;
        }
        .scrollbar::-webkit-scrollbar { width: 8px; }
        .scrollbar::-webkit-scrollbar-thumb {
          background-color: #22c55e;
          border-radius: 9999px;
        }
      `}</style>

      <Header />

      <div className="flex flex-col flex-1 px-6 py-6 gap-6 max-w-7xl mx-auto w-full overflow-hidden">
        <h1 className="text-3xl font-bold">Welcome, {username}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 overflow-hidden">
          {/* EVENTS */}
          <div className="bg-white rounded-2xl shadow border flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 pb-2">
              <h2 className="font-bold text-lg">Upcoming Events</h2>
              <PlusCircle
                className="cursor-pointer"
                onClick={() => {
                  setEditingEvent(null);
                  setShowModal(true);
                }}
              />
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar">
              {groupedEvents.map(([date, items]) => (
                <div key={date} className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-bold text-sm whitespace-nowrap">
                      {shorthandDateMonthToLong(date)}
                    </p>
                    <div className="flex-1 h-px bg-gray-300" />
                  </div>

                  {items.map(([id, event]) => (
                    <div
                      key={id}
                      className="p-2 rounded-lg hover:bg-gray-100 group flex justify-between"
                    >
                      <p>{event.name}</p>

                      {event.editable && (
                        <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                          <Pencil
                            size={16}
                            className="cursor-pointer"
                            onClick={() => {
                              setEditingEvent({ id, data: event });
                              setShowModal(true);
                            }}
                          />
                          <Trash2
                            size={16}
                            className="text-red-500 cursor-pointer"
                            onClick={() => deleteEvent(id)}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="lg:col-span-2 grid gap-4">
            {/* CLOSE FRIENDS */}
            <PanelFriend title="Close Friends">
              {closeFriends.map((f) => (
                <FriendItem key={f.username} friend={f} />
              ))}
            </PanelFriend>

            {/* ALL FRIENDS */}
            <PanelFriend title="All Friends">
              {allFriends.map((f) => (
                <FriendItem key={f.username} friend={f} />
              ))}
            </PanelFriend>

            {/* LISTS */}
            <PanelLists title="My Lists">
              {lists.map((l, i) => (
                <div key={i} className="p-2 h-fit rounded-lg hover:bg-gray-100">
                  {l}
                </div>
              ))}
            </PanelLists>
          </div>
        </div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {showModal && (
          <EventModal
            editing={editingEvent}
            onClose={() => setShowModal(false)}
            onSave={(name, date) => {
              if (editingEvent) {
                updateEvent(editingEvent.id, name, date, true);
              } else {
                addEvent(name, date, true);
              }
              setShowModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================= REUSABLE Panels ================= */

function PanelFriend({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow border flex flex-col overflow-hidden">
      <div className="p-3 font-semibold">{title}</div>
      <div className="flex-1 flex flex-row overflow-x-auto scrollbar px-3">
        {children}
      </div>
    </div>
  );
}

function PanelLists({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow border flex flex-col overflow-hidden min-h-fit h-full">
      <div className="p-3 font-semibold">{title}</div>
      <div className="flex-1 h-fit flex flex-row overflow-x-auto scrollbar px-3">
        {children}
      </div>
    </div>
  );
}

/* ================= FRIEND ITEM ================= */

function FriendItem({ friend }: { friend: Friend }) {
  return (
    <a
      href={`/profile/${encodeURIComponent(friend.username)}`}
      className="flex flex-row items-center gap-3 p-2 rounded-lg hover:bg-gray-100 h-fit min-h-24"
    >
      {friend.img ? (
        <img src={friend.img} className="w-12 h-12 rounded-full object-cover" />
      ) : (
        <CircleUserRound strokeWidth={1} className="w-16 h-16 text-gray-400" />
      )}

      <div className="flex flex-col">
        <span className="text-sm font-medium">{friend.name}</span>
        <span className="text-xs text-gray-400">@{friend.username}</span>
      </div>
    </a>
  );
}

/* ================= MODAL ================= */

function EventModal({
  editing,
  onClose,
  onSave,
}: {
  editing: EditingEvent;
  onClose: () => void;
  onSave: (name: string, date: string) => void;
}) {
  const [name, setName] = useState(editing?.data.name || "");
  const [date, setDate] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function formatDate(value: string) {
    const [y, m, d] = value.split("-");
    return `${d}-${m}-${y}`;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={() => {
          onClose();
          setShowEmojiPicker((x) => !x);
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -25 }}
        className="fixed inset-0 flex items-center justify-center z-50"
      >
        <div
          className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm flex flex-col gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="font-bold text-xl">
            {editing ? "Edit Event" : "Add Event"}
          </h2>

          <div className="relative">
            <input
              ref={inputRef}
              className="border rounded-xl px-3 py-2 pr-10 w-full"
              value={name}
              placeholder="Jane's Birthday 🎂"
              onChange={(e) => setName(e.target.value)}
            />

            <button
              className="absolute right-2 top-2 cursor-pointer"
              onClick={() => setShowEmojiPicker((x) => !x)}
            >
              😊
            </button>

            {showEmojiPicker && (
              <div ref={pickerRef} className="absolute top-12 right-0">
                <EmojiPicker
                  onEmojiClick={(e: EmojiClickData) =>
                    setName((prev) => prev + e.emoji)
                  }
                />
              </div>
            )}
          </div>

          <input
            type="date"
            className="border rounded-xl px-3 py-2"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="cursor-pointer font-medium hover:scale-105 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(name, formatDate(date))}
              className="bg-(--local-green) hover:bg-(--local-green-light) text-white px-4 py-2 rounded-xl cursor-pointer font-medium hover:scale-105 transition-all duration-300"
            >
              Save
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
