'use client';
import { useRef } from 'react';
import { exportAll, importAll } from '@/lib/storage';
import { useToast } from '@/state/AppProviders';

/** Créditos, hojas en PDF y copia de seguridad de todo lo guardado en el navegador */
export function Footer() {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const doExport = () => {
    const blob = new Blob([JSON.stringify({ app: 'cubo-algs', version: 2, exported: new Date().toISOString(), stores: exportAll() }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `cubo-algs-progreso-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const doImport = async (file?: File) => {
    if (!file) return;
    try {
      const d = JSON.parse(await file.text());
      // formato antiguo (solo estados) o el nuevo con todas las claves
      importAll(d.stores ?? { 'cubo-algs-v1': { status: d.status ?? {}, pick: d.pick ?? {}, custom: d.custom ?? {} }, ...(d.timer ? { 'cubo-algs-timer-v1': d.timer } : {}) });
      toast('Progreso importado'); setTimeout(() => location.reload(), 600);
    } catch { toast('El archivo no es un progreso válido'); }
  };

  return (
    <footer className="foot">
      <span>Dibujos del cubo generados en la app. F2L: numeración y algoritmos de <a href="https://www.speedcubedb.com/a/3x3/F2L" target="_blank" rel="noopener noreferrer">SpeedCubeDB</a>. Tu progreso se guarda en este navegador.</span>
      <span className="foot-actions">
        <a href="/pdf/F2L.pdf" download>Hoja F2L (PDF)</a>
        <a href="/pdf/OLL.pdf" download>Hoja OLL (PDF)</a>
        <a href="/pdf/PLL.pdf" download>Hoja PLL (PDF)</a>
        <button className="link" onClick={doExport}>Exportar progreso</button>
        <button className="link" onClick={() => fileRef.current?.click()}>Importar progreso</button>
        <input ref={fileRef} type="file" accept="application/json" hidden onChange={e => { doImport(e.target.files?.[0]); e.target.value = ''; }} />
      </span>
    </footer>
  );
}
