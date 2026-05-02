import { StudentResult } from "../types";
import { CLASSES } from "../constants";

export default function HistoryView({ history }: { history: StudentResult[] }) {
  return (
    <div className="rounded-lg border border-[#d4c9b0] bg-white shadow-lg overflow-hidden">
      <div className="bg-[#1a1a2e] p-4 text-white">
        <h3 className="font-serif text-sm font-bold">Audit History / Logs</h3>
      </div>
      <div className="p-6">
        {history.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <p className="text-sm">No backup records available.</p>
            <p className="text-[10px] uppercase tracking-widest mt-2">History is generated on data updates</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.slice().reverse().map((h, i) => (
              <div 
                key={i} 
                className="group relative rounded-lg border border-[#d4c9b0] bg-[#f5f3ee] p-4 transition-all hover:border-[#1a1a2e] hover:shadow-md"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#b8860b]">
                    Backup Created: {h.updatedAt}
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold text-gray-500 shadow-sm">
                    Ref ID: {h.id.split('_').pop()}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-gray-400">Student</p>
                    <p className="font-serif text-base font-bold text-[#1a1a2e]">{h.studentName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-gray-400">Origin</p>
                    <p className="text-sm font-medium">{CLASSES.find(c => c.v === h.studentClass)?.l} · Roll {h.rollNo}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-gray-400">Result</p>
                    <p className="text-sm font-bold text-[#8b1a1a]">{h.result?.grade} ({h.result?.pct}%)</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-[10px] font-bold uppercase text-gray-400">Modified By</p>
                    <p className="text-xs font-bold text-[#1a1a2e]">{h.updatedBy}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
