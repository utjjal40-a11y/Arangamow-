import { useState } from "react";
import { Users, TrendingUp, Printer, ListFilter, Trash2, ChevronRight, FileSpreadsheet } from "lucide-react";
import { StudentResult } from "../types";
import { CLASSES, SESSIONS, SPECIAL_CLASSES, ALL_50_CLASSES } from "../constants";
import { colorFor } from "../lib/utils";
import { exportClassToExcel } from "../services/excelService";

export default function ClassWiseResult({
  results,
  onDelete,
  onSheet,
  onClassFilter,
}: {
  results: StudentResult[];
  onDelete: (id: string) => void;
  onSheet: (rec: StudentResult) => void;
  onClassFilter: (cls: string) => void;
}) {
  const [selCls, setSelCls] = useState("");
  const [selSess, setSelSess] = useState("");
  const [delStudent, setDelStudent] = useState<StudentResult | null>(null);

  const filtered = results.filter(
    (r) => (!selCls || r.studentClass === selCls) && (!selSess || r.session === selSess)
  );
  
  const passed = filtered.filter((r) => r.result?.grade !== "E").length;
  const avg = filtered.length
    ? (filtered.reduce((a, r) => a + parseFloat(r.result?.pct || "0"), 0) / filtered.length).toFixed(2)
    : "0.00";

  return (
    <div className="space-y-8">
      {/* Filter Stats */}
      <div className="rounded-lg border border-[#d4c9b0] bg-white p-6 shadow-md">
        <div className="mb-6 flex flex-wrap items-end gap-6">
          <div className="flex-1 min-w-[200px] space-y-1">
            <label className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">Select Session</label>
            <select
              className="w-full rounded-md border border-[#d4c9b0] bg-[#f5f3ee] px-3 py-2 text-sm focus:border-[#2d2d4e] focus:bg-white focus:outline-none"
              value={selSess}
              onChange={(e) => setSelSess(e.target.value)}
            >
              <option value="">All Academic Years</option>
              {SESSIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button 
              className="rounded-md border-2 border-[#1a1a2e] px-6 py-2 text-sm font-bold text-[#1a1a2e] transition-all hover:bg-[#1a1a2e] hover:text-white"
              onClick={() => { setSelCls(""); setSelSess(""); }}
            >
              Clear
            </button>
            <button 
              className="flex items-center gap-2 rounded-md bg-[#1a1a2e] px-6 py-2 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#2d2d4e]"
              onClick={() => exportClassToExcel(filtered, selCls || "All")}
            >
              <FileSpreadsheet size={16} />
              Export All Current
            </button>
          </div>
        </div>

        <div className="mb-6 space-y-2">
           <label className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">Filter by Class</label>
           <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
              {CLASSES.map(c => (
                <button
                  key={c.v}
                  onClick={() => setSelCls(selCls === c.v ? "" : c.v)}
                  className={`flex flex-col items-center justify-center rounded-md border-2 py-2 transition-all ${
                    selCls === c.v 
                      ? 'border-[#1a1a2e] bg-[#1a1a2e] text-white' 
                      : 'border-[#f5f3ee] bg-[#f5f3ee] text-[#1a1a2e] hover:border-gray-300'
                  }`}
                >
                  <span className="font-serif text-lg font-bold">{c.v}</span>
                  <span className="text-[8px] uppercase">{c.sp ? 'Spl' : 'Std'}</span>
                </button>
              ))}
           </div>
        </div>

        {filtered.length > 0 && (
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-[#d4c9b0] sm:grid-cols-4">
            <div className="bg-white p-4 text-center">
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Enrolled</div>
              <div className="font-serif text-2xl font-bold text-[#1a1a2e]">{filtered.length}</div>
            </div>
            <div className="bg-white p-4 text-center">
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Passed</div>
              <div className="font-serif text-2xl font-bold text-green-600">{passed}</div>
            </div>
            <div className="bg-white p-4 text-center">
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Failures</div>
              <div className="font-serif text-2xl font-bold text-red-600">{filtered.length - passed}</div>
            </div>
            <div className="bg-white p-4 text-center">
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Class Avg</div>
              <div className="font-serif text-2xl font-bold text-[#b8860b]">{avg}%</div>
            </div>
          </div>
        )}
      </div>

      {/* Class Sections */}
      {(selCls ? [selCls] : CLASSES.map((c) => c.v)).map((cls) => {
        const rows = filtered.filter((r) => r.studentClass === cls);
        if (!rows.length) return null;
        
        const ci = CLASSES.find((c) => c.v === cls);
        const cp = rows.filter((r) => r.result?.grade !== "E").length;
        
        return (
          <div key={cls} className="overflow-hidden rounded-lg border border-[#d4c9b0] bg-white shadow-lg">
            <div className="flex flex-wrap items-center gap-3 bg-[#1a1a2e] p-4 text-white">
              <h3 className="font-serif text-sm font-bold">{ci?.l}</h3>
              <div className="flex gap-2">
                {ALL_50_CLASSES.includes(cls) && <span className="rounded-full bg-blue-600/20 px-2 py-0.5 text-[8px] font-bold uppercase text-blue-300">All /50 Format</span>}
                {SPECIAL_CLASSES.includes(cls) && <span className="rounded-full bg-red-600/20 px-2 py-0.5 text-[8px] font-bold uppercase text-red-300">HY/Annual Format</span>}
              </div>
              <div className="ml-auto flex items-center gap-4">
                <span className="hidden text-[10px] font-bold uppercase tracking-wider text-gray-400 sm:block">
                  {rows.length} Students · {cp} Passed
                </span>
                <button 
                  onClick={() => exportClassToExcel(rows, cls)}
                  className="flex items-center gap-1.5 rounded-md bg-green-600/10 px-3 py-1.5 text-[10px] font-black uppercase text-green-400 transition-colors hover:bg-green-600/20"
                >
                  <FileSpreadsheet size={12} />
                  Export Excel
                </button>
                <button 
                  onClick={() => onClassFilter(cls)}
                  className="flex items-center gap-1 text-[10px] font-black uppercase text-[#b8860b] hover:underline"
                >
                  Full View <ChevronRight size={10} />
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f5f3ee] text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-6 py-4">Rank</th>
                    <th className="px-6 py-4">Roll No</th>
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4">Session</th>
                    <th className="px-6 py-4 text-center">Score</th>
                    <th className="px-6 py-4 text-center">Grade</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ece8df]">
                  {rows
                    .slice()
                    .sort((a, b) => parseFloat(b.result?.pct || "0") - parseFloat(a.result?.pct || "0"))
                    .map((r, i) => {
                      const pct = parseFloat(r.result?.pct || "0");
                      return (
                        <tr key={r.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black ${
                              i === 0 ? 'bg-amber-100 text-amber-600' : 
                              i === 1 ? 'bg-gray-100 text-gray-600' : 
                              i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-transparent text-gray-400'
                            }`}>
                              {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold">{r.rollNo}</td>
                          <td className="px-6 py-4 font-bold text-[#1a1a2e]">{r.studentName}</td>
                          <td className="px-6 py-4">{r.session}</td>
                          <td className="px-6 py-4 text-center font-serif text-sm font-bold text-[#1a1a2e]">{r.result?.pct}%</td>
                          <td className="px-6 py-4 text-center">
                            <span 
                              className="rounded-md px-2 py-0.5 text-[10px] font-bold text-white" 
                              style={{ backgroundColor: colorFor(pct) }}
                            >
                              {r.result?.grade}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <div className="flex justify-end gap-2">
                               <button onClick={() => onSheet(r)} className="rounded p-1.5 text-green-700 hover:bg-green-50"><Printer size={14} /></button>
                               <button onClick={() => setDelStudent(r)} className="rounded p-1.5 text-red-700 hover:bg-red-50"><Trash2 size={14} /></button>
                             </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
      
      {delStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-2xl text-center">
            <h3 className="mb-2 font-serif text-lg font-bold text-[#1a1a2e]">Confirm Deletion</h3>
            <p className="text-sm text-gray-500 mb-6">Remove record for <strong>{delStudent.studentName}</strong>?</p>
            <div className="flex gap-3">
              <button 
                className="flex-1 rounded-md border border-gray-200 py-2.5 text-xs font-bold text-gray-400" 
                onClick={() => setDelStudent(null)}
              >
                Cancel
              </button>
              <button 
                className="flex-1 rounded-md bg-red-600 py-2.5 text-xs font-bold text-white" 
                onClick={() => { onDelete(delStudent.id); setDelStudent(null); }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
