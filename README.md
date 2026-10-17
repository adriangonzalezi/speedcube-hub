# Cubo Algs (Next.js)

Aplicación para aprender, practicar y cronometrar el método CFOP del cubo de Rubik.
Hecha con **Next.js 15 (App Router)**, **React 19** y **TypeScript**. Todo el progreso se guarda en el navegador (localStorage).

## Comandos

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # tests de la lógica del cubo (Vitest)
npm run typecheck  # comprobación de tipos
npm run build      # build de producción
```

## Estructura

```
src/
├─ app/                      Rutas (cada carpeta es una URL)
│  ├─ layout.tsx             Fuentes, estilos y proveedores globales + menú lateral
│  ├─ page.tsx               /                       Inicio
│  ├─ algoritmos/            /algoritmos → /3x3 → /3x3/[set]  (f2l, oll, pll)
│  ├─ cronometro/            /cronometro
│  ├─ resolucion-guiada/     /resolucion-guiada?mezcla=…
│  ├─ practica/[modo]/       /practica/tarjetas | reconocimiento | cruz | ultima-pareja | casos
│  ├─ lecciones/[id]/        /lecciones/piezas, /lecciones/sune…
│  └─ reto-diario/           /reto-diario
│
├─ components/               Interfaz, agrupada por sección
│  ├─ layout/                AppShell (menú lateral y móvil), Footer, iconos
│  ├─ ui/                    Piezas reutilizables: CubeImage, CubeNet, Segmented, SubNav, ProgressBar…
│  ├─ algorithms/            PuzzlePicker, SetPicker, CaseBrowser, CaseCard, PdfDialog
│  ├─ timer/                 TimerPage, TimerStage + useStackmat, StatsPanel, SolveList, EvolutionChart
│  ├─ guide/                 GuidedSolve, OptionCard, useGuidedSolve
│  ├─ practice/              PracticePage y un componente por modo
│  ├─ lessons/               LessonsPage, figuras y content/ (un archivo por unidad)
│  ├─ daily/                 DailyChallenge, useDaily
│  └─ home/                  HomeDashboard
│
├─ lib/                      Lógica sin interfaz (TypeScript puro, con tests)
│  ├─ cube/                  notation, state (simulador), solver (CFOP), scramble (+ Web Worker)
│  ├─ timer/stats.ts         Medias WCA, penalizaciones y fases
│  ├─ storage.ts             usePersistentState: localStorage compartido entre componentes
│  ├─ visualcube.ts          URLs de imágenes y animaciones
│  ├─ pdf.ts                 PDF a medida con jsPDF
│  └─ dates.ts, random.ts
│
├─ state/                    Estado global
│  ├─ progress.ts            Estados de los casos, algoritmo elegido, repaso espaciado, preferencias
│  ├─ timer.ts               Sesiones y tiempos
│  └─ AppProviders.tsx       Avisos, generador de mezclas y modo especial del cronómetro
│
├─ data/                     algorithms.json (119 casos verificados) y sus tipos
└─ styles/                   CSS por sección (tokens de diseño en base.css)

tests/                       Simulador frente a cubejs, algoritmos, resolución guiada y reglas de las lecciones
public/                      PDFs ya hechos e imágenes para el PDF a medida
```
