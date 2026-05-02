import { Printer, Download, ChevronLeft } from "lucide-react";
import { StudentResult } from "../types";
import { SCHOOL, ESTD, CLASSES, SPECIAL_CLASSES } from "../constants";
import { getLabels, getMax, colorFor } from "../lib/utils";

export default function Marksheet({
  rec,
  onBack,
}: {
  rec: StudentResult;
  onBack: () => void;
}) {
  const { studentName, studentClass, rollNo, session, selectedSubjects, subjectMarks, gunotsob, result } = rec;
  const bd = result?.bd;
  const clsLabel = CLASSES.find((c) => c.v === studentClass)?.l || studentClass;
  const { fa1: fa1Header, sa1: sa1Header, fa2: fa2Header, sa2: sa2Header } = getLabels(studentClass);

  const downloadPDF = () => {
    const rows = (selectedSubjects || [])
      .map((sub) => {
        const m = subjectMarks?.[sub] || { fa1: "", hy: "", fa2: "", ann: "" };
        const mx = getMax(sub, studentClass);
        return `
        <tr>
          <td style="text-align:left;font-weight:700;padding:8px 10px;border:1px solid #000">${sub}</td>
          <td style="border:1px solid #000;padding:8px 10px;text-align:center">${m.fa1 || "—"} / ${mx.fa1}</td>
          <td style="border:1px solid #000;padding:8px 10px;text-align:center">${m.hy || "—"} / ${mx.hy}</td>
          <td style="border:1px solid #000;padding:8px 10px;text-align:center">${m.fa2 || "—"} / ${mx.fa2}</td>
          <td style="border:1px solid #000;padding:8px 10px;text-align:center">${m.ann || "—"} / ${mx.ann}</td>
        </tr>`;
      })
      .join("");

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${studentName} - Marksheet</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;700&display=swap');
        body { font-family: 'Inter', sans-serif; margin: 0; padding: 20mm; color: #000; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px double #000; padding-bottom: 10px; }
        .header h1 { font-family: 'Playfair Display', serif; font-size: 26pt; margin: 0; }
        .header p { font-size: 10pt; margin: 2px 0; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10pt; }
        th, td { border: 1px solid #000; padding: 6px 8px; text-align: center; }
        th { background-color: #f2f2f2; font-weight: 700; }
        .meta-table td { border: none; text-align: left; padding: 4px 0; font-size: 11pt; }
        .summary-table th { background-color: #000; color: #fff; }
        .footer { margin-top: 60px; display: flex; justify-content: space-between; gap: 40px; }
        .sig-box { text-align: center; flex: 1; border-top: 1px solid #000; padding-top: 5px; font-size: 9pt; font-weight: 700; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${SCHOOL}</h1>
        <p>${ESTD} · Academic Assessment Record</p>
        <p><strong>Session: ${session}</strong></p>
      </div>

      <table class="meta-table">
        <tr>
          <td><strong>Name:</strong> ${studentName}</td>
          <td><strong>Class:</strong> ${clsLabel}</td>
          <td><strong>Roll No:</strong> ${rollNo}</td>
        </tr>
      </table>

      <table>
        <thead>
          <tr>
            <th style="text-align:left">Subject</th>
            <th>${fa1Header}</th>
            <th>${sa1Header}</th>
            <th>${fa2Header}</th>
            <th>${sa2Header}</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
          <tr style="background:#eee; font-weight:700">
            <td style="text-align:left">TOTAL RAW MARKS</td>
            <td>${bd?.fa1 || 0}/${bd?.fa1Max || 0}</td>
            <td>${bd?.hy || 0}/${bd?.hyMax || 0}</td>
            <td>${bd?.fa2 || 0}/${bd?.fa2Max || 0}</td>
            <td>${bd?.ann || 0}/${bd?.annMax || 0}</td>
          </tr>
        </tbody>
      </table>

      <table class="summary-table">
        <thead>
          <tr>
            <th>FA-1(10%)</th>
            <th>${sa1Header}(35%)</th>
            <th>FA-2(10%)</th>
            <th>${sa2Header}(35%)</th>
            <th>Gunotsob(10%)</th>
            <th>Overall%</th>
            <th>Grade</th>
          </tr>
        </thead>
        <tbody>
          <tr style="font-weight:700; font-size:12pt">
            <td>${bd?.fa1W}</td>
            <td>${bd?.hyW}</td>
            <td>${bd?.fa2W}</td>
            <td>${bd?.annW}</td>
            <td>${gunotsob}% → ${bd?.gunoW}</td>
            <td style="font-size:14pt">${result?.pct}%</td>
            <td style="font-size:14pt; color: ${colorFor(parseFloat(result?.pct || "0"))}">${
      result?.grade
    }</td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        <div class="sig-box">Parent's Signature</div>
        <div class="sig-box">Class Teacher's Signature</div>
        <div class="sig-box">Headmaster's Signature</div>
      </div>
    </body>
    </html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.print();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <button
          className="flex items-center gap-2 rounded-md border-2 border-[#1a1a2e] px-4 py-2 text-sm font-bold text-[#1a1a2e] transition-all hover:bg-[#1a1a2e] hover:text-white"
          onClick={onBack}
        >
          <ChevronLeft size={18} />
          Back to List
        </button>
        <button
          className="flex items-center gap-2 rounded-md bg-[#1a1a2e] px-4 py-2 text-sm font-bold text-white shadow-md transition-all hover:bg-[#2d2d4e]"
          onClick={downloadPDF}
        >
          <Download size={18} />
          Download / Print PDF
        </button>
      </div>

      <div className="mx-auto max-w-[800px] border-2 border-black bg-white p-12 text-black shadow-2xl">
        <div className="mb-8 border-b-4 border-double border-black pb-4 text-center">
          <h1 className="font-serif text-3xl font-bold">{SCHOOL}</h1>
          <p className="mt-1 text-xs font-medium tracking-wide">{ESTD} · Academic Assessment Record</p>
          <p className="mt-4 text-sm font-bold">Session: {session}</p>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-4 border border-black p-4 text-sm">
          <div><span className="font-bold">Name:</span> {studentName}</div>
          <div className="text-center"><span className="font-bold">Class:</span> {clsLabel}</div>
          <div className="text-right"><span className="font-bold">Roll No:</span> {rollNo}</div>
        </div>

        <table className="w-full border-collapse border border-black text-xs">
          <thead>
            <tr className="bg-gray-100 italic">
              <th className="border border-black p-3 text-left">Subject</th>
              <th className="border border-black p-3 font-serif">{fa1Header}</th>
              <th className="border border-black p-3 font-serif">{sa1Header}</th>
              <th className="border border-black p-3 font-serif">{fa2Header}</th>
              <th className="border border-black p-3 font-serif">{sa2Header}</th>
            </tr>
          </thead>
          <tbody>
            {selectedSubjects?.map((sub) => {
              const m = subjectMarks?.[sub] || { fa1: "", hy: "", fa2: "", ann: "" };
              const mx = getMax(sub, studentClass);
              return (
                <tr key={sub}>
                  <td className="border border-black p-3 font-bold">{sub}</td>
                  <td className="border border-black p-3 text-center">{m.fa1 || "—"} / {mx.fa1}</td>
                  <td className="border border-black p-3 text-center">{m.hy || "—"} / {mx.hy}</td>
                  <td className="border border-black p-3 text-center">{m.fa2 || "—"} / {mx.fa2}</td>
                  <td className="border border-black p-3 text-center">{m.ann || "—"} / {mx.ann}</td>
                </tr>
              );
            })}
            <tr className="bg-gray-50 font-bold">
              <td className="border border-black p-3">TOTAL</td>
              <td className="border border-black p-3 text-center">{bd?.fa1 || 0}/{bd?.fa1Max || 0}</td>
              <td className="border border-black p-3 text-center">{bd?.hy || 0}/{bd?.hyMax || 0}</td>
              <td className="border border-black p-3 text-center">{bd?.fa2 || 0}/{bd?.fa2Max || 0}</td>
              <td className="border border-black p-3 text-center">{bd?.ann || 0}/{bd?.annMax || 0}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-8 overflow-hidden rounded border border-black">
          <table className="m-0 w-full border-collapse text-center text-[10px]">
             <thead>
               <tr className="bg-black text-white text-[9px] uppercase tracking-wider font-bold">
                 <th className="p-2">FA-1 (10%)</th>
                 <th className="p-2">{sa1Header}(35%)</th>
                 <th className="p-2">FA-2 (10%)</th>
                 <th className="p-2">{sa2Header}(35%)</th>
                 <th className="p-2">Gunotsob(10%)</th>
                 <th className="p-2">Overall%</th>
                 <th className="p-2">Grade</th>
               </tr>
             </thead>
             <tbody className="font-bold text-base">
               <tr>
                 <td className="p-4 border-r border-black">{bd?.fa1W}</td>
                 <td className="p-4 border-r border-black">{bd?.hyW}</td>
                 <td className="p-4 border-r border-black">{bd?.fa2W}</td>
                 <td className="p-4 border-r border-black">{bd?.annW}</td>
                 <td className="p-4 border-r border-black">{gunotsob}% → {bd?.gunoW}</td>
                 <td className="p-4 border-r border-black font-serif text-2xl">{result?.pct}%</td>
                 <td className="p-4 font-serif text-2xl" style={{ color: colorFor(parseFloat(result?.pct || "0")) }}>{result?.grade}</td>
               </tr>
             </tbody>
          </table>
        </div>

        <div className="mt-20 flex justify-between gap-12 font-bold px-4">
          <div className="w-1/3 border-t border-black pt-2 text-center text-[10px]">Parent</div>
          <div className="w-1/3 border-t border-black pt-2 text-center text-[10px]">Class Teacher</div>
          <div className="w-1/3 border-t border-black pt-2 text-center text-[10px]">Headmaster</div>
        </div>
      </div>
    </div>
  );
}
