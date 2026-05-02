import { useState, useRef, useEffect } from "react";
import { 
  Plus, Save, RotateCcw, Search, GraduationCap, 
  Trash2, AlertCircle, CheckCircle2, ChevronRight, Download
} from "lucide-react";
import { motion } from "motion/react";
import { 
  CLASSES, SESSIONS, SUBJECTS, WEIGHTS, 
  ALL_50_CLASSES, ALWAYS_50_SUBJECTS, SPECIAL_CLASSES 
} from "../constants";
import { StudentResult, User, Mark } from "../types";
import { calcResult, getMax, getLabels, colorFor } from "../lib/utils";

const blankF = () => ({
  studentName: "",
  studentClass: "",
  rollNo: "",
  session: "",
  selectedSubjects: [],
  subjectMarks: {} as Record<string, Mark>,
  gunotsob: "",
});

const emptyM = (): Mark => ({ fa1: "", hy: "", fa2: "", ann: "" });

export default function RecordForm({
  user,
  results,
  onSave,
  onUpdate,
  onHistory,
  onSheet,
}: {
  user: User;
  results: StudentResult[];
  onSave: (rec: StudentResult) => void;
  onUpdate: (updated: StudentResult) => void;
  onHistory: (entry: StudentResult) => void;
  onSheet: (rec: StudentResult) => void;
}) {
  const [form, setForm] = useState(blankF());
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [existId, setEid] = useState<string | null>(null);
  const [errors, setErrs] = useState<Record<string, boolean>>({});
  const [alert, setAlert] = useState<{ t: "s" | "e" | "i" | "w"; msg: string } | null>(null);
  const [confirm, setCnf] = useState(false);
  const [successRec, setSuccessRec] = useState<StudentResult | null>(null);

  const loadRecord = (rec: StudentResult) => {
    setForm({
      studentName: rec.studentName,
      studentClass: rec.studentClass,
      rollNo: rec.rollNo,
      session: rec.session,
      selectedSubjects: [...(rec.selectedSubjects || [])],
      subjectMarks: JSON.parse(JSON.stringify(rec.subjectMarks || {})),
      gunotsob: rec.gunotsob || "",
    });
    setMode("edit");
    setEid(rec.id);
    setAlert({
      t: "i",
      msg: `✏ Editing: ${rec.studentName} · ${
        CLASSES.find((c) => c.v === rec.studentClass)?.l
      } · Roll ${rec.rollNo}`,
    });
  };

  // Expose loadRecord for external use
  (window as any).__loadRecord = loadRecord;

  const live = calcResult(
    Object.fromEntries(
      (form.selectedSubjects || []).map((s) => [s, form.subjectMarks?.[s] || emptyM()])
    ),
    form.selectedSubjects || [],
    form.gunotsob,
    form.studentClass
  );
  const bd = live?.bd;
  const ns = form.selectedSubjects.length;

  useEffect(() => {
    // Auto-check for existing records when Roll, Class, and Session are filled
    if (form.rollNo.trim() && form.studentClass && form.session) {
      const ex = results.find(
        (r) =>
          r.rollNo.trim().toUpperCase() === form.rollNo.trim().toUpperCase() &&
          r.studentClass === form.studentClass &&
          r.session === form.session
      );
      if (ex && mode === "add") {
        loadRecord(ex);
        setAlert({ 
          t: "w", 
          msg: `🔍 Record Found: ${ex.studentName} has existing marks. Switching to Update Mode.` 
        });
      }
    }
  }, [form.rollNo, form.studentClass, form.session, results]);

  const checkDup = () => {
    if (!form.rollNo || !form.studentClass || !form.session) {
      setAlert({ t: "e", msg: "Fill Roll No, Class and Session first." });
      return;
    }
    const ex = results.find(
      (r) =>
        r.rollNo.trim().toUpperCase() === form.rollNo.trim().toUpperCase() &&
        r.studentClass === form.studentClass &&
        r.session === form.session
    );
    if (ex) {
      loadRecord(ex);
      setAlert({ t: "s", msg: `✅ Found: ${ex.studentName}. Everything is loaded for update.` });
    } else {
      setMode("add");
      setEid(null);
      setAlert({ t: "i", msg: "🆕 No existing record found — Ready for new entry." });
    }
  };

  const toggleSub = (sub: string) => {
    const sel = form.selectedSubjects.includes(sub)
      ? form.selectedSubjects.filter((s) => s !== sub)
      : [...form.selectedSubjects, sub];
    
    const marks = { ...form.subjectMarks };
    if (!marks[sub]) marks[sub] = emptyM();
    setForm((f) => ({ ...f, selectedSubjects: sel, subjectMarks: marks }));
  };

  const handleMark = (sub: string, field: keyof Mark, val: string) => {
    const mxVal = getMax(sub, form.studentClass)[field];
    const num = parseFloat(val);
    const key = `${sub}_${field}`;
    
    if (val !== "" && (isNaN(num) || num < 0 || num > mxVal)) {
      setErrs((e) => ({ ...e, [key]: true }));
    } else {
      setErrs((e) => {
        const n = { ...e };
        delete n[key];
        return n;
      });
    }

    setForm((f) => ({
      ...f,
      subjectMarks: {
        ...f.subjectMarks,
        [sub]: { ...(f.subjectMarks[sub] || emptyM()), [field]: val },
      },
    }));
  };

  const validate = () => {
    const e: Record<string, boolean> = {};
    if (!form.studentName.trim()) e.studentName = true;
    if (!form.studentClass) e.studentClass = true;
    if (!form.rollNo.trim()) e.rollNo = true;
    if (!form.session) e.session = true;
    if (!form.selectedSubjects.length) e.subjects = true;
    
    const gv = parseFloat(form.gunotsob);
    if (form.gunotsob === "" || isNaN(gv) || gv < 0 || gv > 100) e.gunotsob = true;
    
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const doSave = () => {
    if (!validate()) {
      setAlert({ t: "e", msg: "Please fix structural errors before saving." });
      return;
    }
    setCnf(true);
  };

  const handleConfirm = () => {
    setCnf(false);
    const now = new Date().toLocaleString("en-IN");
    
    if (mode === "add") {
      const dup = results.find(
        (r) =>
          r.rollNo.trim().toUpperCase() === form.rollNo.trim().toUpperCase() &&
          r.studentClass === form.studentClass &&
          r.session === form.session
      );
      if (dup) {
        setAlert({ t: "w", msg: "⚠ Entry already exists. Switched to Edit Mode." });
        loadRecord(dup);
        return;
      }
      const rec: StudentResult = {
        ...form,
        id: `r_${Date.now()}`,
        result: live,
        updatedBy: user.name,
        updatedAt: now,
      };
      onSave(rec);
      setSuccessRec(rec);
      reset();
    } else {
      const prev = results.find((r) => r.id === existId);
      if (prev) onHistory({ ...prev, updatedBy: user.name, updatedAt: now });
      
      const updated: StudentResult = {
        ...form,
        id: existId!,
        result: live,
        updatedBy: user.name,
        updatedAt: now,
      };
      onUpdate(updated);
      setSuccessRec(updated);
    }
  };

  const reset = () => {
    setForm(blankF());
    setMode("add");
    setAlert(null);
    setErrs({});
    setEid(null);
  };

  const { fa1: fa1Label, sa1: sa1Label, fa2: fa2Label, sa2: sa2Label } = getLabels(form.studentClass);

  return (
    <div className="space-y-6">
      {alert && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-lg border-l-4 p-4 text-sm shadow-sm flex items-center gap-3 ${
            alert.t === 's' ? 'bg-green-50 border-green-600 text-green-800' :
            alert.t === 'e' ? 'bg-red-50 border-red-600 text-red-800' :
            alert.t === 'i' ? 'bg-blue-50 border-blue-600 text-blue-800' :
            'bg-amber-50 border-amber-600 text-amber-800'
          }`}
        >
          {alert.t === 's' && <CheckCircle2 size={18} />}
          {alert.t === 'e' && <AlertCircle size={18} />}
          {alert.msg}
        </motion.div>
      )}

      <div className="overflow-hidden rounded-lg border border-[#d4c9b0] bg-white shadow-lg">
        <div className="flex flex-wrap items-center gap-3 bg-[#1a1a2e] p-4 text-white">
          <Plus size={18} />
          <h3 className="font-serif text-sm font-bold">Record Student Marks</h3>
          <span className={`ml-auto rounded-full px-3 py-0.5 text-[10px] font-bold tracking-wider ${
            mode === 'edit' ? 'bg-red-600' : 'bg-green-600'
          }`}>
            {mode === 'edit' ? '✏ EDIT MODE' : '➕ ADD MODE'}
          </span>
        </div>

        <div className="p-6">
          {/* Section 1: Check */}
          <div className="mb-6">
            <div className="mb-4 flex items-center gap-2 border-b-2 border-[#1a1a2e] pb-1 font-serif text-sm font-bold text-[#1a1a2e]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1a1a2e] text-[10px] text-white">1</span>
              Duplicate Check / Lookup
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold tracking-wider text-[#2d2d4e] uppercase">Roll No *</label>
                <input
                  className={`w-full rounded-md border border-[#d4c9b0] bg-[#f5f3ee] px-3 py-2 text-sm focus:border-[#2d2d4e] focus:bg-white focus:outline-none ${errors.rollNo ? 'border-red-500' : ''}`}
                  value={form.rollNo}
                  onChange={(e) => setForm(f => ({ ...f, rollNo: e.target.value }))}
                  placeholder="e.g. 2024001"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold tracking-wider text-[#2d2d4e] uppercase">Session *</label>
                <select
                  className={`w-full rounded-md border border-[#d4c9b0] bg-[#f5f3ee] px-3 py-2 text-sm focus:border-[#2d2d4e] focus:bg-white focus:outline-none ${errors.session ? 'border-red-500' : ''}`}
                  value={form.session}
                  onChange={(e) => setForm(f => ({ ...f, session: e.target.value }))}
                >
                  <option value="">— Select —</option>
                  {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <button 
                className="flex items-center justify-center gap-2 self-end rounded-md bg-[#1a1a2e] h-[38px] text-sm font-bold text-white transition-colors hover:bg-[#2d2d4e]"
                onClick={checkDup}
              >
                <Search size={16} />
                Check Record
              </button>
            </div>
          </div>

          {/* Section 2: Student Info */}
          <div className="mb-6">
            <div className="mb-4 flex items-center gap-2 border-b-2 border-[#1a1a2e] pb-1 font-serif text-sm font-bold text-[#1a1a2e]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1a1a2e] text-[10px] text-white">2</span>
              Student Details
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-1 md:col-span-1">
                <label className="text-[10px] font-bold tracking-wider text-[#2d2d4e] uppercase">Student Name *</label>
                <input
                  className={`w-full rounded-md border border-[#d4c9b0] bg-[#f5f3ee] px-3 py-2 text-sm focus:border-[#2d2d4e] focus:bg-white focus:outline-none ${errors.studentName ? 'border-red-500' : ''}`}
                  value={form.studentName}
                  onChange={(e) => setForm(f => ({ ...f, studentName: e.target.value }))}
                  placeholder="Full name"
                />
              </div>
              
              <div className="md:col-span-2">
                <div className="mb-2 text-[10px] font-bold tracking-wider text-gray-500 uppercase">🎓 Select Class</div>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                  {CLASSES.map(c => (
                    <button
                      key={c.v}
                      type="button"
                      className={`flex aspect-square flex-col items-center justify-center rounded-md border-2 transition-all hover:bg-gray-50 ${
                        form.studentClass === c.v 
                          ? 'border-[#1a1a2e] bg-[#1a1a2e] text-white' 
                          : c.sp ? 'border-[#b8860b] text-[#8b1a1a]' : 'border-[#d4c9b0] text-[#1a1a2e]'
                      }`}
                      onClick={() => setForm(f => ({ ...f, studentClass: c.v }))}
                    >
                      <span className="font-serif text-lg font-bold">{c.v}</span>
                      <span className="text-[8px] uppercase tracking-tighter opacity-70">
                        {c.sp ? '★ Spl' : 'Std'}
                      </span>
                    </button>
                  ))}
                </div>
                {form.studentClass && (
                  <div className="mt-3 flex items-center gap-3 rounded-md border border-[#d4c9b0] bg-white p-2">
                    <span className="font-serif text-sm font-bold text-[#1a1a2e]">
                      {CLASSES.find(c => c.v === form.studentClass)?.l}
                    </span>
                    {ALL_50_CLASSES.includes(form.studentClass) ? (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-bold text-blue-700">All /50 · 1SA/2SA</span>
                    ) : SPECIAL_CLASSES.includes(form.studentClass) ? (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-bold text-red-700">HY / Annual Format</span>
                    ) : (
                      <span className="text-[9px] text-gray-500">1SA / 2SA Format</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Subjects */}
          <div className="mb-6">
            <div className="mb-4 flex items-center gap-2 border-b-2 border-[#1a1a2e] pb-1 font-serif text-sm font-bold text-[#1a1a2e]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1a1a2e] text-[10px] text-white">3</span>
              Select Subjects
            </div>
            {errors.subjects && <p className="mb-2 text-xs text-red-500">⚠ Select at least one subject.</p>}
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map(sub => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => toggleSub(sub)}
                  className={`rounded-full border-2 px-4 py-1.5 text-xs font-medium transition-all ${
                    form.selectedSubjects.includes(sub)
                      ? 'border-[#1a1a2e] bg-[#1a1a2e] text-white'
                      : 'border-[#d4c9b0] bg-gray-50 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Marks */}
          {ns > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mb-4 flex items-center gap-2 border-b-2 border-[#1a1a2e] pb-1 font-serif text-sm font-bold text-[#1a1a2e]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1a1a2e] text-[10px] text-white">4</span>
                Enter Assessment Scores
              </div>

              <div className="mb-4 rounded-lg border-2 border-[#b8860b] bg-amber-50 p-4">
                <h4 className="mb-3 font-serif text-xs font-bold text-[#1a1a2e]">🏆 Gunotsob — Weightage: 10%</h4>
                <div className="flex flex-wrap items-center gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold tracking-wider text-[#2d2d4e] uppercase">Percentage (0–100) *</label>
                    <input
                      className={`w-32 rounded-md border border-[#d4c9b0] bg-white px-3 py-2 text-center font-serif text-xl font-bold text-red-700 focus:border-[#2d2d4e] focus:outline-none ${errors.gunotsob ? 'border-red-500' : ''}`}
                      type="number"
                      min="0"
                      max="100"
                      value={form.gunotsob}
                      onChange={(e) => setForm(f => ({ ...f, gunotsob: e.target.value }))}
                      placeholder="85"
                    />
                  </div>
                  {form.gunotsob !== "" && !errors.gunotsob && (
                    <div className="animate-in fade-in zoom-in duration-300">
                      <div className="font-serif text-3xl font-bold text-red-700">{form.gunotsob}%</div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase">Wtd: {((parseFloat(form.gunotsob) || 0) / 100 * WEIGHTS.guno).toFixed(2)} / {WEIGHTS.guno}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto rounded-md border border-[#d4c9b0]">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#1a1a2e] text-white">
                      <th className="p-3 text-left">Subject</th>
                      <th className="p-3 text-center">
                        {fa1Label}
                        <span className="mt-1 block text-[9px] font-normal tracking-wide opacity-70">10% WT</span>
                      </th>
                      <th className="p-3 text-center">
                        {sa1Label}
                        <span className="mt-1 block text-[9px] font-normal tracking-wide opacity-70">35% WT</span>
                      </th>
                      <th className="p-3 text-center">
                        {fa2Label}
                        <span className="mt-1 block text-[9px] font-normal tracking-wide opacity-70">10% WT</span>
                      </th>
                      <th className="p-3 text-center">
                        {sa2Label}
                        <span className="mt-1 block text-[9px] font-normal tracking-wide opacity-70">35% WT</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ece8df]">
                    {form.selectedSubjects.map(sub => {
                      const m = form.subjectMarks[sub] || emptyM();
                      const mx = getMax(sub, form.studentClass);
                      return (
                        <tr key={sub} className="hover:bg-gray-50">
                          <td className="p-3 font-bold text-[#1a1a2e]">
                            {sub}
                            {ALWAYS_50_SUBJECTS.includes(sub) && !ALL_50_CLASSES.includes(form.studentClass) && (
                              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[8px] font-bold text-amber-700">/50</span>
                            )}
                          </td>
                          {(['fa1', 'hy', 'fa2', 'ann'] as const).map(f => (
                            <td key={f} className="p-3 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <input
                                  className={`h-9 w-16 rounded border border-[#d4c9b0] bg-white text-center font-medium focus:border-[#1a1a2e] focus:outline-none ${
                                    errors[`${sub}_${f}`] ? 'border-red-500 bg-red-50' : ''
                                  }`}
                                  type="number"
                                  min="0"
                                  max={mx[f]}
                                  value={m[f]}
                                  onChange={(e) => handleMark(sub, f, e.target.value)}
                                  placeholder="—"
                                />
                                <span className="text-[9px] text-gray-400">/{mx[f]}</span>
                              </div>
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                    <tr className="bg-[#f5f3ee] font-bold">
                      <td className="p-3 text-[#1a1a2e]">Σ TOTAL ({ns})</td>
                      <td className="p-3 text-center">
                        {bd?.fa1 || 0}/{bd?.fa1Max || 0}
                        <span className="mt-1 block text-[9px] text-[#8b1a1a]">→ {bd?.fa1W || "0.00"}</span>
                      </td>
                      <td className="p-3 text-center">
                        {bd?.hy || 0}/{bd?.hyMax || 0}
                        <span className="mt-1 block text-[9px] text-[#8b1a1a]">→ {bd?.hyW || "0.00"}</span>
                      </td>
                      <td className="p-3 text-center">
                        {bd?.fa2 || 0}/{bd?.fa2Max || 0}
                        <span className="mt-1 block text-[9px] text-[#8b1a1a]">→ {bd?.fa2W || "0.00"}</span>
                      </td>
                      <td className="p-3 text-center">
                        {bd?.ann || 0}/{bd?.annMax || 0}
                        <span className="mt-1 block text-[9px] text-[#8b1a1a]">→ {bd?.annW || "0.00"}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Summary Bar: Words and specific metrics deleted as requested */}
              <div className="mt-6 flex flex-wrap gap-px overflow-hidden rounded-lg bg-[#1a1a2e]">
                {/* 
                   Request: Delate class subjects 1stFA Wtd HY/SA Wtd Gunotsob and overall percentage % words 
                   I am deleting the labels and content for these as requested.
                */}
                <div className="flex flex-1 flex-col items-center justify-center p-4 min-w-[120px]">
                  <div className="font-serif text-3xl font-bold text-white">
                    {live?.grade || "E"}
                  </div>
                  <div 
                    className="mt-1 text-[10px] font-bold tracking-widest text-[#bbb] uppercase" 
                    style={{ color: colorFor(parseFloat(live?.pct || '0')) }}
                  >
                    Grade
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="mt-10 flex flex-wrap gap-4">
            {mode === 'add' ? (
              <button 
                className="flex items-center gap-2 rounded-md bg-[#1a1a2e] px-8 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-[#2d2d4e] active:scale-95"
                onClick={doSave}
              >
                <Save size={18} />
                Save Result
              </button>
            ) : (
              <button 
                className="flex items-center gap-2 rounded-md bg-red-700 px-8 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-red-800 active:scale-95"
                onClick={doSave}
              >
                <RotateCcw size={18} />
                Update Result
              </button>
            )}
            <button 
              className="flex items-center gap-2 rounded-md border-2 border-[#1a1a2e] px-8 py-3 text-sm font-bold text-[#1a1a2e] transition-all hover:bg-[#1a1a2e] hover:text-white"
              onClick={reset}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {confirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm rounded-lg bg-white shadow-2xl overflow-hidden"
          >
            <div className="border-b border-gray-100 p-4">
              <h3 className="font-serif text-lg font-bold text-[#1a1a2e]">
                {mode === "add" ? "Confirm Save" : "Confirm Update"}
              </h3>
            </div>
            <div className="p-6 text-sm text-gray-600 space-y-3 leading-relaxed">
              <p>
                {mode === "add" 
                  ? "Are you sure you want to save this new result record?" 
                  : `Overwrite the existing result for ${form.studentName}?`}
              </p>
              <div className="rounded-md bg-gray-50 p-3 text-[11px] font-mono border border-gray-100">
                Roll: {form.rollNo}<br/>
                Class: {CLASSES.find(c => c.v === form.studentClass)?.l}<br/>
                Session: {form.session}
              </div>
              {mode === "edit" && <p className="text-red-600 font-medium">A copy of the previous record will be stored in History.</p>}
            </div>
            <div className="flex gap-3 bg-gray-50 p-4">
              <button className="flex-1 rounded-md border border-[#1a1a2e] bg-white py-2.5 text-xs font-bold text-[#1a1a2e] hover:bg-gray-100" onClick={() => setCnf(false)}>Cancel</button>
              <button 
                className={`flex-1 rounded-md py-2.5 text-xs font-bold text-white ${mode === "add" ? "bg-green-700 hover:bg-green-800" : "bg-red-700 hover:bg-red-800"}`} 
                onClick={handleConfirm}
              >
                {mode === "add" ? "Save Now" : "Update Now"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {successRec && (
        <div className="fixed inset-0 z-[101] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-xl bg-white shadow-2xl overflow-hidden"
          >
            <div className="bg-green-600 p-8 text-center text-white">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="font-serif text-2xl font-bold">Result Saved!</h3>
              <p className="mt-2 text-sm text-green-100 font-medium opacity-90">
                Data for {successRec.studentName} has been successfully recorded.
              </p>
            </div>
            <div className="p-8 space-y-4">
              <div className="flex flex-col gap-3">
                <button 
                  className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#1a1a2e] py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#2d2d4e] active:scale-[0.98]"
                  onClick={() => {
                    const rec = successRec;
                    setSuccessRec(null);
                    onSheet(rec);
                  }}
                >
                  <Download size={20} />
                  Download Marksheet
                </button>
                <button 
                  className="w-full rounded-lg border-2 border-gray-200 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50"
                  onClick={() => setSuccessRec(null)}
                >
                  Close & Add Another
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
