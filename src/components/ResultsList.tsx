import { useState, useEffect } from "react";
import { Search, Filter, Printer, Edit3, Trash2, X, Download } from "lucide-react";
import { StudentResult } from "../types";
import { CLASSES, SESSIONS, SPECIAL_CLASSES, ALL_50_CLASSES } from "../constants";
import { colorFor } from "../lib/utils";

export default function ResultsList({
  results,
  onDelete,
  onSheet,
  onEdit,
  initialClass = "",
}: {
  results: StudentResult[];
  onDelete: (id: string) => void;
  onSheet: (rec: StudentResult) => void;
  onEdit: (rec: StudentResult) => void;
  initialClass?: string;
}) {
  const [q, setQ] = useState("");
  const [cls, setCls] = useState(initialClass);
  const [sess, setSess] = useState("");
  const [delStudent, setDelStudent] = useState<StudentResult | null>(null);

  useEffect(() => {
    setCls(initialClass);
  }, [initialClass]);

  const filtered = results.filter((r) => {
    const t = !q || r.studentName.toLowerCase().includes(q.toLowerCase()) || r.rollNo.includes(q);
    return t && (!cls || r.studentClass === cls) && (!sess || r.session === sess);
  }).sort((a,b) => a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true }));

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="rounded-lg border border-[#d4c9b0] bg-white p-6 shadow-md">
        <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
          <Filter size={16} className="text-[#b8860b]" />
          <h3 className="font-serif text-sm font-bold text-[#1a1a2e]">Search & Filter Results</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">Search Student</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full rounded-md border border-[#d4c9b0] bg-[#f5f3ee] py-2 pl-9 pr-3 text-sm focus:border-[#2d2d4e] focus:bg-white focus:outline-none"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Name / Roll No"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">Class</label>
            <select
              className="w-full rounded-md border border-[#d4c9b0] bg-[#f5f3ee] px-3 py-2 text-sm focus:border-[#2d2d4e] focus:bg-white focus:outline-none"
              value={cls}
              onChange={(e) => setCls(e.target.value)}
            >
              <option value="">All Classes</option>
              {CLASSES.map((c) => (
                <option key={c.v} value={c.v}>{c.l}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">Session</label>
            <select
              className="w-full rounded-md border border-[#d4c9b0] bg-[#f5f3ee] px-3 py-2 text-sm focus:border-[#2d2d4e] focus:bg-white focus:outline-none"
              value={sess}
              onChange={(e) => setSess(e.target.value)}
            >
              <option value="">All Sessions</option>
              {SESSIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              className="w-full rounded-md border border-[#1a1a2e] bg-white py-2 text-sm font-bold text-[#1a1a2e] transition-colors hover:bg-gray-100"
              onClick={() => { setQ(""); setCls(""); setSess(""); }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="rounded-lg border border-[#d4c9b0] bg-white shadow-lg overflow-hidden">
        <div className="flex items-center justify-between bg-[#1a1a2e] p-4 text-white">
          <div className="flex items-center gap-3">
            <Download size={18} />
            <h3 className="font-serif text-sm font-bold text-white">Student Academic Records</h3>
          </div>
          <span className="rounded-full bg-[#b8860b] px-3 py-0.5 text-[10px] font-bold uppercase">{filtered.length} Records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f5f3ee] text-[10px] font-bold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-6 py-4">Roll</th>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Class</th>
                <th className="px-6 py-4 text-center">Subjects</th>
                <th className="px-6 py-4 text-center">Gunotsob</th>
                <th className="px-6 py-4 text-center">Score</th>
                <th className="px-6 py-4 text-center">Grade</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ece8df]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center text-gray-400">No records matching your criteria.</td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const pct = parseFloat(r.result?.pct || "0");
                  return (
                    <tr key={r.id} className="hover:bg-gray-50 group">
                      <td className="px-6 py-4"><strong>{r.rollNo}</strong></td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#1a1a2e]">{r.studentName}</div>
                        <div className="text-[10px] text-gray-400">{r.session}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold text-white shadow-sm ${
                          SPECIAL_CLASSES.includes(r.studentClass) ? 'bg-[#8b1a1a]' : 
                          ALL_50_CLASSES.includes(r.studentClass) ? 'bg-blue-600' : 'bg-[#1a1a2e]'
                        }`}>
                          {r.studentClass}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">{r.selectedSubjects?.length || 0}</td>
                      <td className="px-6 py-4 text-center font-bold text-gray-500">
                        {r.gunotsob}%
                      </td>
                      <td className="px-6 py-4 text-center font-serif text-sm font-bold text-[#1a1a2e]">
                        {r.result?.pct}%
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span 
                          className="inline-block rounded-md px-3 py-1 text-[11px] font-black text-white shadow-sm" 
                          style={{ backgroundColor: colorFor(pct) }}
                        >
                          {r.result?.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button 
                            className="rounded-md bg-gray-100 p-2 text-[#1a1a2e] hover:bg-[#1a1a2e] hover:text-white transition-all"
                            title="Edit Record"
                            onClick={() => onEdit(r)}
                          >
                            <Edit3 size={14} />
                          </button>
                          <button 
                            className="rounded-md bg-green-50 p-2 text-green-700 hover:bg-green-700 hover:text-white transition-all"
                            title="Print Marksheet"
                            onClick={() => onSheet(r)}
                          >
                            <Printer size={14} />
                          </button>
                          <button 
                            className="rounded-md bg-red-50 p-2 text-red-700 hover:bg-red-700 hover:text-white transition-all"
                            title="Delete Record"
                            onClick={() => setDelStudent(r)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation */}
      {delStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg bg-white shadow-2xl p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Trash2 size={24} />
            </div>
            <h3 className="mb-2 font-serif text-lg font-bold text-[#1a1a2e]">Permanently Delete?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Remove the result record for <strong>{delStudent.studentName}</strong>?<br/>
              This operation cannot be reversed.
            </p>
            <div className="flex gap-3">
              <button 
                className="flex-1 rounded-md border-2 border-gray-200 py-2.5 text-xs font-bold text-gray-400 hover:border-gray-300 hover:text-gray-500" 
                onClick={() => setDelStudent(null)}
              >
                Cancel
              </button>
              <button 
                className="flex-1 rounded-md bg-red-600 py-2.5 text-xs font-bold text-white hover:bg-red-700" 
                onClick={() => { onDelete(delStudent.id); setDelStudent(null); }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
