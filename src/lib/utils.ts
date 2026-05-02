import { WEIGHTS, GRADES, ALWAYS_50_SUBJECTS, ALL_50_CLASSES } from "../constants";
import { Mark } from "../types";

export const gradeFor = (p: number) => (GRADES.find((g) => Math.round(p) >= g.min) || GRADES[5]).g;
export const colorFor = (p: number) => (GRADES.find((g) => Math.round(p) >= g.min) || GRADES[5]).bg;

export const getMax = (subject: string, studentClass: string) => {
  if (ALL_50_CLASSES.includes(studentClass)) return { fa1: 50, hy: 50, fa2: 50, ann: 50 };
  if (ALWAYS_50_SUBJECTS.includes(subject)) return { fa1: 50, hy: 50, fa2: 50, ann: 50 };
  return { fa1: 50, hy: 100, fa2: 50, ann: 100 };
};

export function calcResult(
  marks: Record<string, Mark>,
  subs: string[],
  gunotsob: string,
  studentClass: string
) {
  const ns = subs.length;
  if (!ns) return null;

  let fa1 = 0,
    hy = 0,
    fa2 = 0,
    ann = 0,
    fa1Max = 0,
    hyMax = 0,
    fa2Max = 0,
    annMax = 0;

  subs.forEach((s) => {
    const m = marks[s] || { fa1: "0", hy: "0", fa2: "0", ann: "0" };
    const mx = getMax(s, studentClass);
    fa1 += parseFloat(m.fa1) || 0;
    fa1Max += mx.fa1;
    hy += parseFloat(m.hy) || 0;
    hyMax += mx.hy;
    fa2 += parseFloat(m.fa2) || 0;
    fa2Max += mx.fa2;
    ann += parseFloat(m.ann) || 0;
    annMax += mx.ann;
  });

  const gunoPct = parseFloat(gunotsob) || 0;
  const fa1W = (fa1 / fa1Max) * WEIGHTS.fa1;
  const hyW = (hy / hyMax) * WEIGHTS.hy;
  const fa2W = (fa2 / fa2Max) * WEIGHTS.fa2;
  const annW = (ann / annMax) * WEIGHTS.ann;
  const gunoW = (gunoPct / 100) * WEIGHTS.guno;
  const total = fa1W + hyW + fa2W + annW + gunoW;

  return {
    pct: total.toFixed(2),
    grade: gradeFor(total),
    bd: {
      fa1,
      hy,
      fa2,
      ann,
      fa1Max,
      hyMax,
      fa2Max,
      annMax,
      fa1W: fa1W.toFixed(2),
      hyW: hyW.toFixed(2),
      fa2W: fa2W.toFixed(2),
      annW: annW.toFixed(2),
      gunoW: gunoW.toFixed(2),
      gunoPct,
    },
  };
}

export function getLabels(studentClass: string) {
  const HY_ANN_CLASSES = ["V", "VIII"];
  if (HY_ANN_CLASSES.includes(studentClass)) {
    return { 
      fa1: "1st Formative Assessment", 
      sa1: "Half-Yearly Examination", 
      fa2: "2nd Formative Assessment", 
      sa2: "Annual Examination" 
    };
  }
  return { 
    fa1: "1st Formative Assessment", 
    sa1: "1st Summative Assessment", 
    fa2: "2nd Formative Assessment", 
    sa2: "2nd Summative Assessment" 
  };
}
