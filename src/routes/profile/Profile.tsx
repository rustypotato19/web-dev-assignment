import { useContext } from "react";
import Header from "../../components/header/Header";
import SessionContext from "../../utils/contexts/sessions/SessionContext";
import MyError from "../error/Error";

export default function Profile() {
  const ctx = useContext(SessionContext);

  if (!ctx) {
    return (
      <MyError
        ErrorCode={1002}
        ErrorMessage="Context failed to initiialise. Please try again."
      />
    );
  }

  if (!ctx.username || ctx.username === "") {
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
      <div className="w-screen min-h-60 h-fit flex flex-col justify-center items-center gap-6 z-0">
        <h1 className="text-2xl font-bold text-(--local-green-dark)">
          <span className="italic">{ctx.username}</span>'s Profile
        </h1>
      </div>
    </div>
  );
}
