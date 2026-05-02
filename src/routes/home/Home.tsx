import { useContext, useEffect, useMemo, useRef, useState } from "react";
import Header from "../../components/header/Header";
import SessionContext from "../../utils/contexts/sessions/SessionContext";
import MyError from "../error/Error";
import shorthandDateMonthToLong from "../../utils/helpers/DateTime";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import EmojiPicker from "emoji-picker-react";

type EventType = {
  name: string;
  date: string;
};

export default function Home() {
  const ctx = useContext(SessionContext);

  const username = ctx?.username || ctx?.email?.split("@")[0];

  const [events, setEvents] = useState<Record<string, EventType>>({
    "1": { name: "My Birthday 🎂", date: "19-05" },
    "2": { name: "Alex B Birthday 🤝", date: "02-06" },
    "3": { name: "Todd Birthday 💪", date: "05-06" },
    "4": { name: "Office Meeting", date: "22-08" },
    "5": { name: "Mother's Birthday", date: "10-09" },
    "6": { name: "My Birthday 🎂", date: "19-05" },
    "7": { name: "Alex B Birthday 🤝", date: "02-06" },
    "8": { name: "Todd Birthday 💪", date: "05-06" },
    "9": { name: "Office Meeting", date: "22-08" },
    "10": { name: "Mother's Birthday", date: "10-09" },
    "11": { name: "My Birthday 🎂", date: "19-05" },
    "12": { name: "Alex B Birthday 🤝", date: "02-06" },
    "13": { name: "Todd Birthday 💪", date: "05-06" },
    "14": { name: "Office Meeting", date: "22-08" },
    "15": { name: "Mother's Birthday", date: "10-09" },
  });

  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<{
    id: string;
    data: EventType;
  } | null>(null);

  const sortedEvents = useMemo(() => {
    return Object.entries(events).sort(([, a], [, b]) => {
      const [d1, m1] = a.date.split("-").map(Number);
      const [d2, m2] = b.date.split("-").map(Number);
      return m1 === m2 ? d1 - d2 : m1 - m2;
    });
  }, [events]);

  function addEvent(name: string, date: string) {
    const id = Date.now().toString();
    setEvents((prev) => ({ ...prev, [id]: { name, date } }));
  }

  function updateEvent(id: string, name: string, date: string) {
    setEvents((prev) => ({ ...prev, [id]: { name, date } }));
  }

  function deleteEvent(id: string) {
    setEvents((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  }

  if (!ctx) {
    return (
      <MyError
        ErrorCode={1002}
        ErrorMessage="Context failed to initialise. Please try again."
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Scrollbar styles */}
      <style>{`
        .scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #22c55e transparent;
          scrollbar-gutter: stable;
        }
        .scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar::-webkit-scrollbar-thumb {
          background-color: #22c55e;
          border-radius: 9999px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
      `}</style>

      <Header />

      <div className="flex flex-col flex-1 px-6 py-6 gap-6 max-w-7xl mx-auto w-full overflow-hidden">
        <h1 className="text-3xl font-bold">Welcome, {username}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 overflow-hidden">
          {/* EVENTS PANEL */}
          <div className="bg-white rounded-2xl shadow border flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-4 pb-2">
              <h2 className="font-bold text-lg">Upcoming Events</h2>
              <PlusCircle
                className="cursor-pointer hover:scale-110 transition"
                onClick={() => {
                  setEditingEvent(null);
                  setShowModal(true);
                }}
              />
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar">
              <div className="flex flex-col gap-2 pr-2">
                {sortedEvents.map(([id, event]) => (
                  <div
                    key={id}
                    className="p-3 rounded-xl hover:bg-gray-100 transition group"
                  >
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm whitespace-nowrap">
                        {shorthandDateMonthToLong(event.date)}
                      </p>
                      <div className="flex-1 h-px bg-gray-300" />
                    </div>

                    <div className="flex justify-between items-center">
                      <p>{event.name}</p>

                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
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
                          className="cursor-pointer text-red-500"
                          onClick={() => deleteEvent(id)}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {sortedEvents.length === 0 && (
                  <p className="text-gray-400 text-center py-4">
                    No events yet
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="lg:col-span-2 grid gap-4">
            {["Close Friends", "All Friends", "My Lists"].map((x) => (
              <div
                key={x}
                className="bg-white rounded-2xl shadow p-4 border flex items-center justify-center text-gray-400"
              >
                {x}
              </div>
            ))}
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
                updateEvent(editingEvent.id, name, date);
              } else {
                addEvent(name, date);
              }
              setShowModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================= MODAL ================= */

function EventModal({
  editing,
  onClose,
  onSave,
}: {
  editing: { id: string; data: EventType } | null;
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

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    }

    if (showEmojiPicker) {
      window.addEventListener("click", handleClick);
    }

    return () => window.removeEventListener("click", handleClick);
  }, [showEmojiPicker]);

  function formatDate(value: string) {
    const [, month, day] = value.split("-");
    return `${day}-${month}`;
  }

  const valid = name.trim() && date;

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="fixed inset-0 flex items-center justify-center z-50"
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <div
          className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm flex flex-col gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="font-bold text-xl">
            {editing ? "Edit Event" : "Add Event"}
          </h2>

          {/* INPUT + EMOJI */}
          <div className="relative">
            <input
              ref={inputRef}
              placeholder="Event name"
              className="border rounded-xl px-3 py-2 pr-10 w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <button
              type="button"
              className="absolute right-2 top-2 text-xl"
              onClick={(e) => {
                e.stopPropagation();
                setShowEmojiPicker((x) => !x);
              }}
            >
              😊
            </button>

            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  ref={pickerRef}
                  className="absolute top-12 right-0 z-50"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <EmojiPicker
                    onEmojiClick={(emojiData) => {
                      setName((prev) => prev + emojiData.emoji);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* DATE */}
          <input
            type="date"
            className="border rounded-xl px-3 py-2"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          {/* ACTIONS */}
          <div className="flex justify-end gap-2">
            <button onClick={onClose}>Cancel</button>
            <button
              disabled={!valid}
              onClick={() => onSave(name.trim(), formatDate(date))}
              className="bg-green-500 text-white px-4 py-2 rounded-xl disabled:opacity-40"
            >
              {editing ? "Save" : "Add"}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
