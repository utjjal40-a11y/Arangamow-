import { useState, useEffect, useRef } from "react";
import { 
  LayoutDashboard, ClipboardList, Database, 
  History, Users, LogOut, Menu, X, Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { doc, getDocFromServer } from 'firebase/firestore';
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { db, auth } from './lib/firebase';

import { SCHOOL, ESTD } from "./constants";
import { Page, StudentResult, User } from "./types";

import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import RecordForm from "./components/RecordForm";
import ResultsList from "./components/ResultsList";
import ClassWiseResult from "./components/ClassWise";
import HistoryView from "./components/History";
import Marksheet from "./components/Marksheet";
import { firebaseService } from "./services/firebaseService";

const USERS: User[] = [
  { id: "u1", name: "Arangamow MV School", role: "admin", u: "admin", p: "admin123" },
  { id: "u2", name: "Teacher Borah", role: "teacher", u: "teacher1", p: "teach123" },
];

const USER_KEY = "amvs_user_session";

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [page, setPage] = useState<Page>("dashboard");
  const [results, setResults] = useState<StudentResult[]>([]);
  const [history, setHistory] = useState<StudentResult[]>([]);
  const [sbOpen, setSbOpen] = useState(false);
  const [sheet, setSheet] = useState<StudentResult | null>(null);
  const [filterCls, setFCls] = useState("");
  const [loading, setLoading] = useState(true);
  const [fbUser, setFbUser] = useState<any>(null);

  const authAttempted = useRef(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setFbUser(u);
      if (!u && user && !authAttempted.current) {
        authAttempted.current = true;
        signInAnonymously(auth).catch((err) => {
          console.warn("Background Firebase Auth failed:", err.message);
        });
      }
    });
    return () => unsubAuth();
  }, [user]);

  useEffect(() => {
    // 1. Test Connection
    const test = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        console.error("Firebase connection test failed:", error);
      }
    };
    test();

    // 2. Subscribe to Real-time data
    const unsubResults = firebaseService.subscribeResults(async (data) => {
      // Migration logic: Sync local storage to Firebase
      const local = localStorage.getItem("amvs_results_v2");
      if (local) {
        const parsed = JSON.parse(local) as StudentResult[];
        if (parsed.length > 0) {
          console.log("Checking for local records to sync to school database...");
          let migrated = 0;
          for (const r of parsed) {
            // Check if this specific result (based on Roll, Class, Session) exists in fetched data
            const exists = data.find(f => 
              f.rollNo.trim().toUpperCase() === r.rollNo.trim().toUpperCase() && 
              f.studentClass === r.studentClass && 
              f.session === r.session
            );
            
            if (!exists) {
              await firebaseService.saveResult(r).catch(console.error);
              migrated++;
            }
          }
          if (migrated > 0) console.log(`✓ Sync complete: ${migrated} records pushed to central database.`);
          localStorage.removeItem("amvs_results_v2");
        }
      }
      
      setResults(data);
      setLoading(false);
    });

    const unsubHistory = firebaseService.subscribeHistory(async (data) => {
      const local = localStorage.getItem("amvs_history_v2");
      if (local) {
        const parsed = JSON.parse(local) as StudentResult[];
        if (parsed.length > 0) {
          for (const h of parsed) {
            // History is usually unique by timestamp/ID, but let's just push for now
            await firebaseService.addHistory(h).catch(console.error);
          }
          localStorage.removeItem("amvs_history_v2");
        }
      }
      setHistory(data);
    });

    return () => {
      unsubResults();
      unsubHistory();
    };
  }, [fbUser]); // Keep dependency so if auth state changes, we might refresh, but we don't 'return' early anymore

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
    auth.signOut().catch(console.error);
  };

  const handleSave = async (rec: StudentResult) => {
    await firebaseService.saveResult(rec);
  };

  const handleUpdate = async (updated: StudentResult) => {
    await firebaseService.updateResult(updated);
  };

  const handleDelete = async (id: string) => {
    await firebaseService.deleteResult(id);
  };

  const handleHistory = async (entry: StudentResult) => {
    await firebaseService.addHistory(entry);
  };

  const goEdit = (rec: StudentResult) => {
    setPage("record");
    setTimeout(() => {
      if ((window as any).__loadRecord) (window as any).__loadRecord(rec);
    }, 150);
  };

  if (!user) return <Login onLogin={handleLogin} />;
  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#1a1a2e] text-white font-serif italic">Loading Student Records...</div>;

  const NAV = [
    { id: "dashboard", ic: <LayoutDashboard size={20} />, l: "Dashboard" },
    { id: "record", ic: <ClipboardList size={20} />, l: "Record Marks" },
    { id: "results", ic: <Database size={20} />, l: "All Results" },
    { id: "classwise", ic: <Users size={20} />, l: "Class-Wise Stats" },
    { id: "history", ic: <History size={20} />, l: "Edit History" },
  ];

  return (
    <div className="flex min-h-screen bg-[#f5f3ee] font-sans text-[#1a1a2e]">
      {/* Sidebar Mobile Toggle */}
      <button 
        className="fixed top-4 left-4 z-[999] rounded-md bg-[#1a1a2e] p-2 text-white md:hidden" 
        onClick={() => setSbOpen(!sbOpen)}
      >
        {sbOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-[998] w-64 transform bg-[#1a1a2e] text-white transition-transform duration-300 ease-in-out md:translate-x-0 ${sbOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <h2 className="font-serif text-lg font-bold leading-tight">{SCHOOL}</h2>
          <p className="text-[10px] tracking-widest text-[#b8860b] uppercase mt-1">{ESTD}</p>
        </div>
        
        <nav className="mt-4 px-3 space-y-1">
          {NAV.map(n => (
            <button
              key={n.id}
              onClick={() => { setPage(n.id as Page); setSbOpen(false); setSheet(null); }}
              className={`flex w-full items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-all ${
                page === n.id ? 'bg-[#8b1a1a] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {n.ic}
              {n.l}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[#b8860b] flex items-center justify-center font-bold text-[#1a1a2e]">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-xs font-bold">{user.name}</p>
              <p className="text-[10px] text-gray-500 uppercase">{user.role}</p>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        <header className="sticky top-0 z-[50] flex items-center justify-between border-b border-[#d4c9b0] bg-white px-6 py-4 md:px-10">
          <h1 className="font-serif text-xl font-bold capitalize">
            {NAV.find(n => n.id === page)?.l || 'View Result'}
          </h1>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <Calendar size={14} className="text-[#b8860b]" />
            {new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}
          </div>
        </header>

        <div className="p-6 md:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={page + (sheet ? '-sheet' : '')}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {page === "dashboard" && <Dashboard results={results} onNav={p => { setPage(p); setSheet(null); }} />}
              {page === "record" && <RecordForm user={user} results={results} onSave={handleSave} onUpdate={handleUpdate} onHistory={handleHistory} onSheet={(rec) => { setSheet(rec); setPage("results"); }} />}
              {page === "results" && (
                sheet ? <Marksheet rec={sheet} onBack={() => setSheet(null)} /> : 
                <ResultsList results={results} onDelete={handleDelete} onSheet={setSheet} onEdit={goEdit} initialClass={filterCls} />
              )}
              {page === "classwise" && <ClassWiseResult results={results} onDelete={handleDelete} onSheet={r => { setSheet(r); setPage("results"); }} onClassFilter={cls => { setFCls(cls); setSheet(null); setPage("results"); }} />}
              {page === "history" && <HistoryView history={history} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
