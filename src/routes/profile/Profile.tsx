import Header from "../../components/header/Header";
import AuthContext from "../../utils/contexts/sessions/AuthContext";
import MyError from "../../components/error/Error";
import { useParams } from "react-router";
import { CalendarDays, Users, UserRound } from "lucide-react";
import { useContext, useEffect, useState } from "react";

/* ================= TYPES ================= */

type User = {
  uid: number;
  email: string;
  username: string;
  fullname: string;
  profile_image: string | null;
  friends: number[];
  created: string;
  updated: string;
};

type List = {
  listid: number;
  name: string;
  description: string;
  members: number[];
  created: string;
  updated: string;
};

/* ================= MAIN ================= */

export default function Profile() {
  const ctx = useContext(AuthContext);
  const { username: paramUsername } = useParams();

  const isOwnProfile =
    !paramUsername ||
    (ctx?.user?.username && paramUsername === ctx.user.username);

  const username = paramUsername || ctx?.user?.username || "";

  const [user, setUser] = useState<User | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ================= FETCH ================= */

  useEffect(() => {
    async function load() {
      if (!username) return;

      try {
        setLoading(true);

        const userRes = await fetch(
          `https://webdev.aboutkonrad.com/api/users/username/${username}`,
        );

        const userData = await userRes.json();

        if (!userRes.ok || userData.status !== 200) {
          throw new Error(userData.error || "Failed to load user");
        }

        const fetchedUser: User = userData.user;
        setUser(fetchedUser);

        const listRes = await fetch(
          `https://webdev.aboutkonrad.com/api/lists/user/${fetchedUser.uid}`,
        );

        const listData = await listRes.json();

        if (!listRes.ok || listData.status !== 200) {
          throw new Error(listData.error || "Failed to load lists");
        }

        setLists(listData.lists || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [username]);

  /* ================= GUARDS ================= */

  if (!ctx) {
    return (
      <MyError
        ErrorCode={1002}
        ErrorMessage="Auth context failed to initialise."
      />
    );
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

  /* ================= VIEW SWITCH ================= */

  return (
    <div className="min-h-screen bg-gray-50">
      <Header sticky />

      {isOwnProfile ? (
        <MyProfileView user={user} lists={lists} />
      ) : (
        <UserProfileView user={user} lists={lists} />
      )}
    </div>
  );
}

/* ================= MY PROFILE ================= */

function MyProfileView({ user, lists }: { user: User; lists: List[] }) {
  return <ProfileLayout user={user} lists={lists} isOwn />;
}

/* ================= OTHER USER PROFILE ================= */

function UserProfileView({ user, lists }: { user: User; lists: List[] }) {
  return <ProfileLayout user={user} lists={lists} isOwn={false} />;
}

/* ================= SHARED LAYOUT ================= */

function ProfileLayout({
  user,
  lists,
  isOwn,
}: {
  user: User;
  lists: List[];
  isOwn: boolean;
}) {
  return (
    <>
      {/* HERO */}
      <div className="w-full bg-linear-to-br from-(--local-green-light)/80 to-(--local-green-dark) text-white">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col lg:flex-row items-center lg:items-end gap-8">
          <div className="w-50 h-50 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-white flex items-center justify-center">
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
            <h1 className="text-4xl font-bold">{user.fullname}</h1>
            <p className="text-lg opacity-90">@{user.username}</p>

            <div className="flex gap-4 mt-2">
              <Stat label="Friends" value={user.friends?.length ?? 0} />
              <Stat label="Lists" value={lists.length} />
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="text-2xl font-bold text-(--local-green-dark)">
            About
          </h2>

          <div className="flex items-center gap-3 mt-4 text-gray-700">
            <Users size={20} />
            <p>{user.friends?.length ?? 0} friends</p>
          </div>

          <div className="flex items-center gap-3 mt-4 text-gray-700">
            <CalendarDays size={20} />
            <p>Joined {new Date(user.created).toDateString()}</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-2 bg-white rounded-2xl border shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-(--local-green-dark)">
              {isOwn ? "Your Lists" : "Lists"}
            </h2>
            <p className="text-sm text-gray-500">{lists.length} total</p>
          </div>

          {lists.length === 0 ? (
            <p className="text-gray-500">No lists yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lists.map((list) => (
                <div
                  key={list.listid}
                  className="border rounded-2xl p-5 hover:shadow-md transition"
                >
                  <h3 className="font-bold text-lg">{list.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {list.description || "No description"}
                  </p>

                  <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                    <Users size={16} />
                    <p>{list.members?.length ?? 0} members</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ================= SMALL UI PIECE ================= */

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white/10 px-4 py-2 rounded-xl">
      <p className="text-sm opacity-80">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
