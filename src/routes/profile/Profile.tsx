import { useContext } from "react";
import Header from "../../components/header/Header";
import SessionContext from "../../utils/contexts/sessions/SessionContext";
import MyError from "../error/Error";
import { useParams } from "react-router";

export default function Profile() {
  const ctx = useContext(SessionContext);
  const { username: paramUsername } = useParams();

  if (!ctx) {
    return (
      <MyError
        ErrorCode={1002}
        ErrorMessage="Context failed to initiialise. Please try again."
      />
    );
  }

  // Resolve username + email safely
  const username = paramUsername || ctx.username || "";
  const email = ctx.email || "user@gmail.com";

  if (!username) {
    return (
      <MyError
        ErrorCode={1003}
        ErrorMessage="Username could not be resolved and profile could not be loaded. Please try again later."
      />
    );
  }

  return (
    <div>
      <Header />

      <div className="w-screen min-h-60 flex flex-col justify-center items-center gap-6">
        <h1 className="text-2xl font-bold text-(--local-green-dark)">
          <span className="italic">{username || email}</span>
          's Profile
        </h1>
      </div>
    </div>
  );
}
