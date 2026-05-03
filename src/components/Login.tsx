import { useState } from "react";
import { SCHOOL, ESTD } from "../constants";
import { User } from "../types";
import { LogIn, School } from "lucide-react";
import { signInAnonymously } from "firebase/auth";
import { auth } from "../lib/firebase";

const USERS: User[] = [
  { id: "u1", name: "Arangamow MV School", role: "admin", u: "admin", p: "admin123" },
  { id: "u2", name: "Teacher Borah", role: "teacher", u: "teacher1", p: "teach123" },
];

export default function Login({ onLogin }: { onLogin: (user: User) => void }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");

  const go = async () => {
    const f = USERS.find((x) => x.u === u && x.p === p);
    if (f) {
      try {
        await signInAnonymously(auth);
      } catch (err: any) {
        console.warn("Firebase Auth blocked by console settings, using guest mode. (Enable Anonymous Auth in Firebase Console to fix)");
      }
      onLogin(f);
    } else {
      setErr("Invalid credentials.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a1a2e] p-4 text-white">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f5f3ee] text-[#1a1a2e]">
            <School size={32} />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#1a1a2e]">{SCHOOL}</h1>
          <p className="text-sm font-medium text-[#b8860b]">{ESTD} · Portal</p>
        </div>

        {err && (
          <div className="mb-4 rounded-md border-l-4 border-red-500 bg-red-50 p-3 text-sm text-red-700">
            {err}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10.5px] font-bold tracking-wider text-[#2d2d4e] uppercase">
              Username
            </label>
            <input
              className="w-full rounded-md border border-[#d4c9b0] bg-[#f5f3ee] px-3 py-2 text-sm text-[#1a1a2e] focus:border-[#2d2d4e] focus:bg-white focus:outline-none"
              value={u}
              onChange={(e) => setU(e.target.value)}
              placeholder="Enter your username"
              onKeyDown={(e) => e.key === "Enter" && go()}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10.5px] font-bold tracking-wider text-[#2d2d4e] uppercase">
              Password
            </label>
            <input
              className="w-full rounded-md border border-[#d4c9b0] bg-[#f5f3ee] px-3 py-2 text-sm text-[#1a1a2e] focus:border-[#2d2d4e] focus:bg-white focus:outline-none"
              type="password"
              value={p}
              onChange={(e) => setP(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && go()}
            />
          </div>

          <button
            className="flex w-full items-center justify-center gap-2 rounded-md bg-[#1a1a2e] py-3 text-sm font-bold text-white transition-colors hover:bg-[#2d2d4e]"
            onClick={go}
          >
            <LogIn size={18} />
            Log In
          </button>
        </div>


      </div>
    </div>
  );
}
