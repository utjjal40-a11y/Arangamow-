import { 
  ClipboardList, Users, History as HistoryIcon, 
  Search, Award, TrendingUp, BookOpen, Database 
} from "lucide-react";
import { StudentResult, Page } from "../types";
import { colorFor } from "../lib/utils";
import { GRADES, CLASSES, SPECIAL_CLASSES, ALL_50_CLASSES } from "../constants";

export default function Dashboard({
  results,
  onNav,
}: {
  results: StudentResult[];
  onNav: (p: Page) => void;
}) {
  const recent = [...results].reverse().slice(0, 5);
  const avgPct = results.length 
    ? (results.reduce((acc, r) => acc + parseFloat(r.result?.pct || "0"), 0) / results.length).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Actions */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-lg border border-[#d4c9b0] bg-white overflow-hidden shadow-md">
            <div className="bg-[#1a1a2e] p-4 text-white">
              <h3 className="font-serif text-sm font-bold">Quick Actions</h3>
            </div>
            <div className="p-4 space-y-3">
              <button 
                onClick={() => onNav("record")}
                className="flex w-full items-center gap-3 rounded-md bg-[#1a1a2e] p-3 text-left text-sm font-bold text-white transition-all hover:bg-[#2d2d4e]"
              >
                <ClipboardList size={18} />
                Record / Update Marks
              </button>
              <button 
                onClick={() => onNav("results")}
                className="flex w-full items-center gap-3 rounded-md border-2 border-[#1a1a2e] p-3 text-left text-sm font-bold text-[#1a1a2e] transition-all hover:bg-[#1a1a2e] hover:text-white"
              >
                <Search size={18} />
                Search Results
              </button>
              <button 
                onClick={() => onNav("classwise")}
                className="flex w-full items-center gap-3 rounded-md border-2 border-[#1a1a2e] p-3 text-left text-sm font-bold text-[#1a1a2e] transition-all hover:bg-[#1a1a2e] hover:text-white"
              >
                <TrendingUp size={18} />
                Performance Analysis
              </button>
              <button 
                onClick={() => onNav("history")}
                className="flex w-full items-center gap-3 rounded-md border-2 border-[#1a1a2e] p-3 text-left text-sm font-bold text-[#1a1a2e] transition-all hover:bg-[#1a1a2e] hover:text-white"
              >
                <HistoryIcon size={18} />
                Audit Logs
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-[#d4c9b0] bg-white overflow-hidden shadow-md">
            <div className="bg-[#b8860b] p-4 text-white">
              <h3 className="font-serif text-sm font-bold">Grading Key</h3>
            </div>
            <div className="p-4 flex flex-wrap gap-2">
              {GRADES.map(g => (
                <div key={g.g} className="flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: g.bg }} />
                  {g.g}: {g.min}+ %
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Results */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-[#d4c9b0] bg-white overflow-hidden shadow-md">
            <div className="flex items-center justify-between bg-[#1a1a2e] p-4 text-white">
              <h3 className="font-serif text-sm font-bold">Recent Record Entries</h3>
              <button onClick={() => onNav('results')} className="text-[10px] font-bold uppercase tracking-widest text-[#b8860b] hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              {recent.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-300">
                    <Database size={24} />
                  </div>
                  <p className="text-sm text-gray-400">No results recorded yet.</p>
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Class</th>
                      <th className="px-6 py-4">Score</th>
                      <th className="px-6 py-4">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ece8df]">
                    {recent.map(r => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="font-bold text-[#1a1a2e]">{r.studentName}</p>
                          <p className="text-[10px] text-gray-400">Roll: {r.rollNo} · {r.session}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            SPECIAL_CLASSES.includes(r.studentClass) ? 'bg-[#8b1a1a] text-white' : 
                            ALL_50_CLASSES.includes(r.studentClass) ? 'bg-blue-600 text-white' : 'bg-[#1a1a2e] text-white'
                          }`}>
                            {r.studentClass}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-serif font-bold text-[#1a1a2e]">{r.result?.pct}%</td>
                        <td className="px-6 py-4">
                          <span className="rounded-full px-3 py-1 text-[10px] font-bold text-white shadow-sm" style={{ backgroundColor: colorFor(parseFloat(r.result?.pct || "0")) }}>
                            {r.result?.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
