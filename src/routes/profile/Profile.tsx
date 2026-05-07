import Header from "../../components/header/Header";
import SessionContext from "../../utils/contexts/sessions/SessionContext";
import MyError from "../error/Error";
import { useParams } from "react-router";
import { CalendarDays, Globe, Lock, UserRound, Users } from "lucide-react";
import { useContext } from "react";

type PublicList = {
  id: number;
  name: string;
  description: string;
  members: number;
  visibility: "public" | "private";
};

export default function Profile() {
  const ctx = useContext(SessionContext);
  const { username: paramUsername } = useParams();

  // MOCK DATA
  const fullName =
    ctx?.fullname && ctx?.fullname !== ""
      ? ctx?.fullname
      : "FirstName LastName";

  const bio = "Why are any of us here?";

  // Accept File OR string
  const profileImage = localStorage.getItem("profileImage");

  const publicLists: PublicList[] = [
    {
      id: 1,
      name: "Big 40th",
      description: "Gift tracking for my big 40th birthday",
      members: 6,
      visibility: "public",
    },
    {
      id: 2,
      name: "My Christmas list",
      description: "Gift ideas for christmas.",
      members: 32,
      visibility: "public",
    },
  ];

  if (!ctx) {
    return (
      <MyError
        ErrorCode={1002}
        ErrorMessage="Context failed to initiialise. Please try again."
      />
    );
  }

  // Resolve username safely
  const username = paramUsername || ctx?.username || "";

  if (!username) {
    return (
      <MyError
        ErrorCode={1003}
        ErrorMessage="Username could not be resolved and profile could not be loaded. Please try again later."
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header sticky={true} />

      {/* HERO */}
      <div className="w-full bg-linear-to-br from-(--local-green-light)/80 to-(--local-green-dark) text-white">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col lg:flex-row items-center lg:items-end gap-8">
          {/* Profile Picture */}
          <div className="w-50 h-50 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-white flex items-center justify-center shrink-0">
            {profileImage ? (
              <img
                src={profileImage}
                alt={`${username} profile`}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserRound size={100} strokeWidth={1.2} color="gray" />
            )}
          </div>

          {/* User Info */}
          <div className="flex flex-col gap-3 text-center lg:text-left">
            <div>
              <h1 className="text-4xl font-bold">{fullName}</h1>

              <div className="flex items-center gap-2 justify-center lg:justify-start opacity-90 mt-1">
                <p className="text-lg">@{username}</p>
              </div>
            </div>

            <p className="max-w-2xl text-white/90">{bio}</p>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 mt-2 justify-center lg:justify-start">
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                <p className="text-sm opacity-80">Public Lists</p>
                <p className="text-2xl font-bold">
                  {
                    publicLists.filter((list) => list.visibility === "public")
                      .length
                  }
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                <p className="text-sm opacity-80">Friends</p>
                <p className="text-2xl font-bold">24</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                <p className="text-sm opacity-80">Events</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT SIDE */}
        <div className="flex flex-col gap-6">
          {/* About */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-(--local-green-dark)">
              About
            </h2>

            <div className="flex items-center gap-3 text-gray-700">
              <Users size={20} />
              <p>24 friends connected</p>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <CalendarDays size={20} />
              <p>Joined May 2026</p>
            </div>
          </div>

          {/* Activity */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-(--local-green-dark)">
              Recent Activity
            </h2>

            <div className="flex flex-col gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="font-semibold">Created "Big 40th"</p>
                <p className="text-sm text-gray-500">2 days ago</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-3">
                <p className="font-semibold">Created "My Christmas list"</p>
                <p className="text-sm text-gray-500">1 week ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Lists */}
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-(--local-green-dark)">
                Public Lists
              </h2>

              <p className="text-sm text-gray-500">
                {publicLists.length} total
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {publicLists.map((list) => (
                <div
                  key={list.id}
                  className="border rounded-2xl p-5 hover:border-(--local-green) hover:shadow-md transition-all duration-300 cursor-pointer bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-lg">{list.name}</h3>

                      <p className="text-gray-600 text-sm mt-1">
                        {list.description}
                      </p>
                    </div>

                    <div>
                      {list.visibility === "public" ? (
                        <Globe
                          size={18}
                          className="text-(--local-green-dark)"
                        />
                      ) : (
                        <Lock size={18} className="text-gray-400" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-5 text-sm text-gray-500">
                    <Users size={16} />
                    <p>{list.members} members</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Events */}
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <h2 className="text-2xl font-bold text-(--local-green-dark) mb-6">
              Upcoming Events
            </h2>

            <div className="flex flex-col gap-4">
              {[
                {
                  name: "Konrad's Birthday 🎂",
                  date: "19 May 2026",
                },
                {
                  name: "Big 40th",
                  date: "22 May 2026",
                },
                {
                  name: "Christmas Day",
                  date: "25 December 2026",
                },
              ].map((event, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-gray-50 rounded-xl p-4"
                >
                  <div>
                    <p className="font-semibold">{event.name}</p>
                    <p className="text-sm text-gray-500">{event.date}</p>
                  </div>

                  <CalendarDays className="text-(--local-green)" size={20} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
