// Genera un PDF de algoritmos en el navegador con jsPDF.
// Las imágenes van incrustadas (public/pdf-images.json) porque VisualCube no permite usarlas en canvas.
import { SET_INFO, type AlgCase, type CaseSet } from '@/data/algorithms';

export interface PdfPart { set: CaseSet; cases: AlgCase[] }
export interface PdfOptions {
  withAlt: boolean;
  /** Algoritmo que va en negrita para cada caso, y alternativa */
  mainAlg: (c: AlgCase) => string;
  altAlg: (c: AlgCase, main: string) => string | undefined;
  statusLabel: (c: AlgCase) => string | null;
  fileName: string;
}

const TITLES: Record<CaseSet, string> = {
  f2l: 'F2L · Primeras dos capas (hueco delantero derecho)',
  oll: `OLL · ${SET_INFO.oll.title}`,
  pll: `PLL · ${SET_INFO.pll.title}`,
};

export async function downloadPdf(parts: PdfPart[], o: PdfOptions) {
  const [{ jsPDF }, images] = await Promise.all([
    import('jspdf'),
    fetch('/pdf-images.json').then(r => r.json() as Promise<Record<string, string>>),
  ]);
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210, H = 297, M = 12, COLS = 3, CW = (W - 2 * M) / COLS, CH = 31, IMG = 21;
  const date = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  let page = 0, y = 0, first = true;

  const header = (set: CaseSet, total: number) => {
    if (!first) doc.addPage(); first = false; page++;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(0); doc.text(TITLES[set], M, M + 4);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(90);
    doc.text(`${total} casos · ${date}`, W - M, M + 4, { align: 'right' });
    doc.text('Algoritmo principal en negrita y alternativa debajo. Marca la casilla cuando domines el caso.', M, M + 9);
    doc.setDrawColor(0); doc.setLineWidth(0.4); doc.line(M, M + 11, W - M, M + 11);
    doc.setFontSize(7); doc.setTextColor(130); doc.text(`Cubo Algs · imágenes de VisualCube · página ${page}`, W / 2, H - 7, { align: 'center' });
    y = M + 14;
  };

  for (const { set, cases } of parts) {
    header(set, cases.length);
    const groups: string[] = [];
    cases.forEach(c => { if (!groups.includes(c.group)) groups.push(c.group); });
    for (const g of groups) {
      const inGroup = cases.filter(c => c.group === g);
      if (y + 6 + CH > H - M - 4) header(set, cases.length);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(80); doc.text(g.toUpperCase(), M, y + 4);
      y += 6;
      for (let r = 0; r < Math.ceil(inGroup.length / COLS); r++) {
        if (y + CH > H - M - 4) header(set, cases.length);
        inGroup.slice(r * COLS, r * COLS + COLS).forEach((c, k) => {
          const x = M + k * CW;
          doc.setDrawColor(205); doc.setLineWidth(0.2); doc.rect(x, y, CW, CH);
          if (images[c.id]) doc.addImage(images[c.id], 'PNG', x + 2, y + 2, IMG, IMG);
          const tx = x + IMG + 4.5, tw = CW - IMG - 7;
          doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(0); doc.text(c.id, tx, y + 5.5);
          if (c.nick) { doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(100); doc.text(c.nick, tx + doc.getTextWidth(c.id) + 6, y + 5.5); }
          doc.setDrawColor(120); doc.rect(x + CW - 5.5, y + 3.2, 3, 3);
          const main = o.mainAlg(c); const alt = o.altAlg(c, main);
          let yy = y + 10;
          doc.setFont('courier', 'bold'); doc.setFontSize(7.8); doc.setTextColor(0);
          for (const ln of doc.splitTextToSize(main, tw) as string[]) { doc.text(ln, tx, yy); yy += 3.4; }
          if (o.withAlt && alt) {
            yy += 0.6; doc.setFont('courier', 'normal'); doc.setFontSize(6.8); doc.setTextColor(95);
            for (const ln of doc.splitTextToSize(alt, tw) as string[]) { doc.text(ln, tx, yy); yy += 3; }
          }
          doc.setFont('helvetica', 'normal'); doc.setFontSize(6.3); doc.setTextColor(130); doc.text(`Prob. ${c.prob}`, x + 2, y + CH - 2.5);
          const st = o.statusLabel(c); if (st) doc.text(st, x + CW - 2, y + CH - 2.5, { align: 'right' });
        });
        y += CH;
      }
      y += 2;
    }
  }
  doc.save(o.fileName);
}
