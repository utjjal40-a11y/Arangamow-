import * as XLSX from 'xlsx';
import { StudentResult } from '../types';
import { CLASSES } from '../constants';
import { getMax } from '../lib/utils';

export function exportClassToExcel(results: StudentResult[], title: string) {
  const fileName = `Results_${title}_${new Date().toISOString().split('T')[0]}.xlsx`;
  const wb = XLSX.utils.book_new();

  // Group by class if title is "All" or if multiple classes exist
  const classesInResults = Array.from(new Set(results.map(r => r.studentClass)));

  classesInResults.forEach(clsV => {
    const classResults = results
      .filter(r => r.studentClass === clsV)
      .sort((a, b) => parseFloat(b.result?.pct || "0") - parseFloat(a.result?.pct || "0"));

    if (classResults.length === 0) return;

    const classLabel = CLASSES.find(c => c.v === clsV)?.l || clsV;
    const allSubjects = Array.from(new Set(classResults.flatMap(r => r.selectedSubjects || [])));

    const data = classResults.map((r, index) => {
      const row: any = {
        'Rank': index + 1,
        'Roll No': r.rollNo,
        'Student Name': r.studentName,
        'Session': r.session,
      };

      allSubjects.forEach(sub => {
        const mark = (r.subjectMarks || {})[sub] || { fa1: "", hy: "", fa2: "", ann: "" };
        const mx = getMax(sub, r.studentClass);
        
        row[`${sub} FA1 (/${mx.fa1})`] = mark.fa1;
        row[`${sub} HY/SA1 (/${mx.hy})`] = mark.hy;
        row[`${sub} FA2 (/${mx.fa2})`] = mark.fa2;
        row[`${sub} ANN/SA2 (/${mx.ann})`] = mark.ann;
      });

      if (r.result?.bd) {
        const bd = r.result.bd;
        row['Sum FA1'] = bd.fa1;
        row['Sum HY/SA1'] = bd.hy;
        row['Sum FA2'] = bd.fa2;
        row['Sum ANN/SA2'] = bd.ann;
        
        row['Wtd FA1 (10%)'] = bd.fa1W;
        row['Wtd HY/SA1 (40%)'] = bd.hyW;
        row['Wtd FA2 (10%)'] = bd.fa2W;
        row['Wtd ANN/SA2 (40%)'] = bd.annW;
        row['Wtd Gunotsob (10%)'] = bd.gunoW;
      }

      row['Overall %'] = r.result?.pct + '%';
      row['Grade'] = r.result?.grade;

      return row;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, `Class ${clsV}`);
  });

  XLSX.writeFile(wb, fileName);
}
