import React, { useEffect, useMemo, useState } from 'react';
import { Biodata, AtpRow } from '../types';
import { initialCpByFase } from '../data/initialData';
import { PRINT_LOCKED, PRINT_LOCKED_MESSAGE } from '../utils/printLock';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Settings, Printer, PlusCircle, Trash2, Save, Wand2, ChevronUp, ChevronDown, Pencil,
  FileText, ClipboardList, BookOpen, ArrowRight, ArrowLeft, CheckCircle2, X, RotateCcw,
  ClipboardCopy, FileDown, FileSpreadsheet, FileType, HelpCircle, Sparkles, ListChecks, AlarmClock, ClipboardCheck
} from 'lucide-react';

interface AtpTabProps {
  biodata: Biodata;
  defaultSubjectData?: Record<string, Record<string, string[]>>;
  initialSubject?: string;
  onNavigateToRpm?: () => void;
  showToast: (msg: string) => void;
  isDemo?: boolean;
}

interface AtpForm {
  mapel: string;
  semester: string;
  tahunPelajaran: string;
  fase: string;
  kelas: string;
  satuanPendidikan: string;
  mingguEfektif: string;
  jamPerMinggu: string;
  urutan: string;
  pola: string;
  alokasiMode: string;
}

const ATP_SUBJECTS: { value: string; label: string }[] = [
  { value: 'PKN', label: 'Pendidikan Pancasila (PKN)' },
  { value: 'Bahasa Indonesia', label: 'Bahasa Indonesia' },
  { value: 'Matematika', label: 'Matematika' },
  { value: 'IPA', label: 'IPAS (Sains/IPA)' },
  { value: 'TIK', label: 'TIK (Informatika / Komputer)' },
  { value: 'Bahasa dan Sastra Banjar', label: 'Bahasa dan Sastra Banjar' },
  { value: 'SBdP', label: 'SBdP (Seni Budaya & Prakarya)' },
  { value: 'PJOK', label: 'PJOK' },
  { value: 'Bahasa Inggris', label: 'Bahasa Inggris' },
  { value: 'Pendidikan Agama Islam dan Budi Pekerti', label: 'Pendidikan Agama Islam dan Budi Pekerti' },
  { value: 'Baca Tulis Al-Quran', label: 'Baca Tulis Al-Quran (BTQ)' },
  { value: 'Coding', label: 'Coding' },
  { value: 'Pendidikan Agama Kristen dan Budi Pekerti', label: 'Pendidikan Agama Kristen dan Budi Pekerti' },
  { value: 'Pendidikan Agama Katolik dan Budi Pekerti', label: 'Pendidikan Agama Katolik dan Budi Pekerti' },
  { value: 'Pendidikan Agama Buddha dan Budi Pekerti', label: 'Pendidikan Agama Buddha dan Budi Pekerti' },
  { value: 'Pendidikan Agama Hindu dan Budi Pekerti', label: 'Pendidikan Agama Hindu dan Budi Pekerti' }
];

const ATP_STORAGE = (nip: string) => `bakumpul_atp_draft_${(nip || '').trim().replace(/\s+/g, '')}`;
const ATP_RESULTS = (nip: string) => `bakumpul_atp_results_${(nip || '').trim().replace(/\s+/g, '')}`;

const fallbackCp = (mapel: string): string =>
  `Peserta didik mampu memahami konsep dasar ${mapel} serta menerapkan keterampilannya dalam kehidupan sehari-hari secara logis, kreatif, dan bertanggung jawab.`;

const KKO: string[] = [
  'menyambut', 'mengadaptasi', 'mendemonstrasikan', 'memprakarsai', 'memaksimalkan', 'berkolaborasi',
  'mendeteksi', 'memilah', 'mengasumsikan', 'memahami', 'mengenal', 'mengidentifikasi', 'menunjukkan',
  'membaca', 'menulis', 'melakukan', 'mengoperasikan', 'memanfaatkan', 'menerapkan', 'menyusun',
  'menyajikan', 'menginterpretasikan', 'menentukan', 'memecahkan', 'menyelesaikan', 'menganalisis',
  'menceritakan', 'mengapresiasi', 'menghasilkan', 'mengeksplorasi', 'mempraktikkan', 'memberikan',
  'menggunakan', 'menuliskan', 'mengurutkan', 'mengomunikasikan', 'membandingkan', 'menghubungkan',
  'menemukan', 'menguasai', 'menyampaikan', 'membuat', 'memilih', 'mengklasifikasi', 'menilai', 'mengintegrasikan'
];

const KKO_LEVELS: Record<string, number> = {
  menyebut: 1, mengenal: 1, membaca: 1, menulis: 1, memilih: 1, mengidentifikasi: 1, menunjukkan: 1,
  mengurutkan: 1, mengklasifikasi: 1, menceritakan: 2, memahami: 2, menjelaskan: 2, melaksanakan: 2,
  menggunakan: 2, melakukan: 2, menerapkan: 2, menuliskan: 2, menentukan: 2, menemukan: 2, menyajikan: 2,
  menginterpretasikan: 2, mengoperasikan: 2, memanfaatkan: 2, mempraktikkan: 2,
  membandingkan: 3, menganalisis: 3, menyusun: 3, menilai: 3, menghubungkan: 3, mengevaluasi: 3,
  mengapresiasi: 3, mendemonstrasikan: 3, mengintegrasikan: 3, menghasilkan: 3, menyimpulkan: 3,
  memecahkan: 3, menyelesaikan: 3, mencipta: 3, merancang: 3
};

const cap = (s: string): string => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const splitCP = (cp: string): string[] =>
  (cp || '').replace(/\s+/g, ' ').split(/(?:\.|;|,)\s*/).map((s) => s.trim()).filter(Boolean);

const analisisCp = (cp: string): { kompetensi: string[]; materi: string[] } => {
  const kompetensi: string[] = [];
  const materi: string[] = [];
  splitCP(cp).forEach((bagian) => {
    const norm = bagian.toLowerCase();
    const kata = KKO.find((k) => norm.startsWith(k));
    if (kata) kompetensi.push(cap(bagian));
    else materi.push(cap(bagian));
  });
  if (kompetensi.length === 0) kompetensi.push('Memahami');
  if (materi.length === 0) materi.push('Konsep dasar yang relevan');
  return { kompetensi, materi };
};

const levelOf = (kompetensi: string[]): number => {
  const text = (kompetensi || []).join(' ').toLowerCase();
  let lvl = 1;
  KKO.forEach((k) => { if (text.includes(k)) lvl = Math.max(lvl, KKO_LEVELS[k] || 1); });
  return lvl;
};

const makeRow = (cp: string): AtpRow => {
  const { kompetensi, materi } = analisisCp(cp);
  return {
    id: Date.now() + Math.random(),
    cp,
    kompetensi,
    materi,
    tp: cp.trim(),
    materiPokok: materi.join(', '),
    alokasi: '2 JP',
    keterangan: 'Dasar'
  };
};

const manualRow = (tp: string): AtpRow => {
  const { kompetensi, materi } = analisisCp(tp);
  return {
    id: Date.now() + Math.random(),
    cp: '',
    kompetensi,
    materi,
    tp: tp.trim(),
    materiPokok: materi.join(', '),
    alokasi: '2 JP',
    keterangan: 'Dasar'
  };
};

const normalizeRow = (r: Partial<AtpRow>): AtpRow | null => {
  const tp = typeof r.tp === 'string' && r.tp.trim() ? r.tp : '';
  if (!tp) return null;
  const { kompetensi, materi } = analisisCp(tp);
  return {
    id: typeof r.id === 'number' ? r.id : Date.now() + Math.random(),
    cp: typeof r.cp === 'string' ? r.cp : '',
    kompetensi: Array.isArray(r.kompetensi) && r.kompetensi.length ? r.kompetensi : kompetensi,
    materi: Array.isArray(r.materi) && r.materi.length ? r.materi : materi,
    tp,
    materiPokok: typeof r.materiPokok === 'string' && r.materiPokok.trim() ? r.materiPokok : materi.join(', '),
    alokasi: typeof r.alokasi === 'string' && r.alokasi.trim() ? r.alokasi : '2 JP',
    keterangan: typeof r.keterangan === 'string' && r.keterangan.trim() ? r.keterangan : 'Dasar',
    elemen: typeof r.elemen === 'string' ? r.elemen : ''
  };
};

const keteranganFor = (lvl: number, idx: number, total: number): string => {
  if (total === 0) return 'Dasar';
  const pct = idx / total;
  if (lvl === 3) {
    const text = 'Analisis/Penerapan';
    return pct < 0.7 ? 'Analisis' : 'Penerapan';
  }
  if (lvl === 2) return 'Pengembangan';
  return 'Dasar';
};

const jpAuto = (lvl: number): string => `${lvl <= 1 ? 2 : lvl === 2 ? 3 : 4} JP`;

const ORDERS = [
  { id: 'konkret-abstrak', label: 'Konkret → Abstrak' },
  { id: 'mudah-kompleks', label: 'Mudah → Kompleks' },
  { id: 'sederhana-kompleks', label: 'Sederhana → Kompleks' },
  { id: 'kontekstual-abstrak', label: 'Kontekstual → Abstrak' },
  { id: 'otomatis', label: 'Otomatis' }
];

const POLAS = [
  { id: 'otomatis', label: 'Otomatis' },
  { id: 'kompetensi', label: 'Kompetensi bertahap' },
  { id: 'materi', label: 'Materi bertahap' }
];

const emptyForm = (b: Biodata, initialSubject: string): AtpForm => ({
  mapel: initialSubject || 'PKN',
  semester: b.semester || 'Semester 1',
  tahunPelajaran: '2025/2026',
  fase: b.fase || 'Fase B',
  kelas: b.kelas || 'Kelas 4',
  satuanPendidikan: b.namaSekolah || '',
  mingguEfektif: '12',
  jamPerMinggu: '2',
  urutan: 'konkret-abstrak',
  pola: 'otomatis',
  alokasiMode: 'otomatis'
});

const Card: React.FC<{ no: string; title: string; icon: React.ReactNode; right?: React.ReactNode; children: React.ReactNode }> = ({ no, title, icon, right, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden no-print">
    <div className="px-4 py-3 bg-indigo-900 text-white flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <span className="w-5 h-5 rounded-full bg-amber-300 text-indigo-950 text-[10px] font-black flex items-center justify-center shrink-0">{no}</span>
        {icon}
        <h3 className="text-xs font-extrabold uppercase tracking-wide">{title}</h3>
      </div>
      {right}
    </div>
    <div className="p-4 space-y-3">{children}</div>
  </div>
);

const Btn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'primary' | 'ghost' | 'danger' | 'amber' | 'emerald' }> = ({ tone = 'primary', className = '', ...props }) => {
  const toneCls = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-700',
    ghost: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200',
    danger: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200',
    amber: 'bg-amber-500 hover:bg-amber-400 text-indigo-950 border border-amber-600',
    emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700'
  }[tone];
  return <button {...props} className={`${toneCls} ${className} font-bold px-3 py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer`} />;
};

const Label: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => (
  <label className="block">
    <span className="text-[11px] font-bold text-slate-600">{text}</span>
    {children}
  </label>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select {...props} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
);

export const AtpTab: React.FC<AtpTabProps> = ({ biodata, defaultSubjectData, initialSubject, onNavigateToRpm, showToast, isDemo }) => {
  const [form, setForm] = useState<AtpForm>(() => emptyForm(biodata, initialSubject || 'PKN'));
  const [pool, setPool] = useState<AtpRow[]>([]);
  const [pilihIds, setPilihIds] = useState<Set<number>>(new Set());
  const [hasil, setHasil] = useState<AtpRow[]>([]);
  const [tpMode, setTpMode] = useState<'db' | 'manual'>('db');
  const [manualText, setManualText] = useState<string>('');
  const [panduanOpen, setPanduanOpen] = useState<boolean>(false);

  const set = (key: keyof AtpForm, val: string) => setForm((prev) => ({ ...prev, [key]: val }));

  const cpsFor = (mapel: string): string[] => {
    const defs = defaultSubjectData?.[form.fase]?.[mapel];
    return defs && defs.length ? defs : [fallbackCp(mapel)];
  };

  const persist = (f: AtpForm, p: AtpRow[], h: AtpRow[]) => {
    try {
      localStorage.setItem(ATP_STORAGE(biodata.nipGuru), JSON.stringify({ form: f, pool: p, hasil: h }));
    } catch { /* fallback */ }
  };

  useEffect(() => {
    let savedForm: Partial<AtpForm> | null = null;
    let savedHasil: AtpRow[] | null = null;
    try {
      const saved = localStorage.getItem(ATP_STORAGE(biodata.nipGuru));
      if (saved) {
        const parsed = JSON.parse(saved) as { form?: Partial<AtpForm>; hasil?: Partial<AtpRow>[] };
        if (parsed.form && (parsed.form.mapel || parsed.form.semester)) savedForm = parsed.form;
        if (Array.isArray(parsed.hasil) && parsed.hasil.length > 0) savedHasil = parsed.hasil.map(normalizeRow).filter((x): x is AtpRow => Boolean(x));
      }
    } catch { /* fallback */ }

    const combined = { ...emptyForm(biodata, initialSubject || 'PKN'), ...(savedForm || {}) };
    const defs = defaultSubjectData?.[combined.fase]?.[combined.mapel];
    const cpList = defs && defs.length ? defs : [fallbackCp(combined.mapel)];
    const fresh = cpList.map(makeRow);

    // Hasil ATP yang pernah disimpan guru tetap dipertahankan bila masih untuk mapel yang sama
    const keptHasil = savedHasil && savedHasil.length > 0 && (savedForm?.mapel == null || savedForm.mapel === combined.mapel)
      ? savedHasil
      : fresh.map((r) => ({ ...r }));

    setForm((prev) => ({ ...prev, mapel: combined.mapel, fase: combined.fase, kelas: combined.kelas, semester: combined.semester, tahunPelajaran: combined.tahunPelajaran, mingguEfektif: combined.mingguEfektif, jamPerMinggu: combined.jamPerMinggu, urutan: combined.urutan, pola: combined.pola, alokasiMode: combined.alokasiMode }));
    setPool(fresh);
    setHasil(keptHasil);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLocked = (): boolean => {
    if (isDemo) { showToast("🔒 Mode Demo: Pengeditan ATP dikunci dalam mode lihat saja."); return true; }
    return false;
  };

  const handleMapelChange = (mapel: string) => {
    const next = { ...form, mapel };
    const init = cpsFor(mapel).map(makeRow);
    setForm(next);
    setPool(init);
    setHasil(init);
    setPilihIds(new Set());
    persist(next, init, init);
  };

  const togglePilih = (id: number) => {
    setPilihIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const cpAcuan = initialCpByFase?.[form.mapel]?.[form.fase] || '';

  const pilihSemua = () => {
    if (isLocked()) return;
    setPilihIds(new Set(pool.map((p) => p.id)));
    showToast('Semua TP terpilih.');
  };

  const masukkanKeATP = () => {
    if (isLocked()) return;
    if (tpMode === 'manual') {
      const lines = manualText.split('\n').map((s) => s.trim()).filter(Boolean);
      if (!lines.length) { showToast('Masukkan minimal satu TP manual.'); return; }
      const rows = lines.map(manualRow);
      setHasil(rows);
      persist(form, pool, rows);
      showToast(`${rows.length} TP manual dimasukkan ke ATP.`);
      return;
    }
    const selected = pool.filter((p) => pilihIds.has(p.id)).map((r) => ({ ...r }));
    if (!selected.length) { showToast('Pilih TP terlebih dahulu.'); return; }
    setHasil(selected);
    persist(form, pool, selected);
    showToast(`${selected.length} TP dimasukkan ke ATP. Klik ANALISIS & GENERATE untuk menyusun alur.`);
  };

  const updateHasil = (rows: AtpRow[]) => {
    setHasil(rows);
    if (pool.length === 0) setPool(rows.map((r) => ({ ...r })));
    persist(form, pool, rows);
  };

  const doGenerate = () => {
    const src = hasil.length ? hasil : pool;
    if (!src.length) { showToast('Belum ada TP untuk dianalisis.'); return; }
    let next = src.map((r) => ({ ...r, kompetensi: r.kompetensi?.length ? r.kompetensi : analisisCp(r.tp).kompetensi, materi: r.materi?.length ? r.materi : analisisCp(r.tp).materi }));

    if (form.pola === 'kompetensi' || form.pola === 'materi' || form.urutan !== 'manual-keep') {
      next = next.map((r, i) => ({ ...next[i], id: r.id }));
      const scored = next.map((r, idx) => ({ r, lvl: levelOf(r.kompetensi), idx }));
      scored.sort((a, b) => (a.lvl - b.lvl) || (a.idx - b.idx));
      next = scored.map((s) => s.r);
    }

    next = next.map((r, index) => {
      const lvl = levelOf(r.kompetensi);
      const alokasi = form.alokasiMode === 'otomatis' ? jpAuto(lvl) : (r.alokasi || '2 JP');
      return { ...r, alokasi, keterangan: keteranganFor(lvl, index, next.length) };
    });

    updateHasil(next);
    if (form.alokasiMode === 'otomatis') showToast('ATP berhasil di-generate: TP diurutkan (konkret→abstrak), waktu dialokasikan sesuai kompleksitas.');
    else showToast('ATP berhasil di-generate sesuai pengaturan Anda.');
  };

  const regenerate = () => { if (isLocked()) return; doGenerate(); };

  const perbaikiOtomatis = () => {
    if (isLocked()) return;
    const seen = new Set<string>();
    const dedupe = hasil.filter((r) => {
      const k = r.tp.trim().toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    const next = dedupe.map((r) => ({ ...r }));
    updateHasil(next.map((r, i) => ({ ...r, kompetensi: r.kompetensi?.length ? r.kompetensi : ['Memahami'] })));
    doGenerate();
    showToast('TP redundan dihapus dan alur diurutkan ulang.');
  };

  const simpanHasil = () => {
    if (isLocked()) return;
    if (!hasil.length) { showToast('Belum ada hasil ATP untuk disimpan.'); return; }
    try {
      const key = ATP_RESULTS(biodata.nipGuru);
      const prev = JSON.parse(localStorage.getItem(key) || '[]') as unknown[];
      const entry = { tanggal: new Date().toISOString().slice(0, 10), mapel: form.mapel, fase: form.fase, kelas: form.kelas, tahun: form.tahunPelajaran, rows: hasil };
      localStorage.setItem(key, JSON.stringify([entry, ...prev].slice(0, 20)));
      showToast('Hasil ATP berhasil disimpan ke database.');
    } catch { /* fallback */ }
  };

  const moveRow = (id: number, dir: -1 | 1) => {
    const idx = hasil.findIndex((r) => r.id === id);
    const to = idx + dir;
    if (idx < 0 || to < 0 || to >= hasil.length) return;
    const next = [...hasil];
    [next[idx], next[to]] = [next[to], next[idx]];
    updateHasil(next);
  };

  const editCell = (id: number, key: keyof AtpRow, val: string) => {
    updateHasil(hasil.map((r) => (r.id === id ? { ...r, [key]: val } : r)));
  };

  const removeHasil = (id: number) => {
    if (isLocked()) return;
    updateHasil(hasil.filter((r) => r.id !== id));
    showToast('Baris ATP dihapus.');
  };

  const triggerPrint = () => {
    document.body.classList.add('print-atp');
    window.print();
    setTimeout(() => document.body.classList.remove('print-atp'), 400);
  };

  const copyToClipboard = () => {
    const txt = exportText();
    const done = () => showToast('Tabel ATP disalin ke clipboard.');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(done).catch(() => { fallbackCopy(txt); done(); });
    } else { fallbackCopy(txt); done(); }
  };

  const exportWord = () => {
    const html = `<html><head><meta charset="utf-8"></head><body>${exportHtml()}</body></html>`;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    download(blob, `ATP_${form.mapel}_${form.fase}.doc`);
    showToast('Ekspor Word berhasil.');
  };

  const exportExcel = () => {
    const aoa: (string | number)[][] = [
      ['ALUR TUJUAN PEMBELAJARAN (ATP)'],
      [`Sekolah: ${biodata.namaSekolah}`, `Mapel: ${form.mapel}`, `Fase/Kelas: ${form.fase}/${form.kelas}`, `Tahun: ${form.tahunPelajaran}`],
      [],
      ['No', 'Tujuan Pembelajaran', 'Materi Pokok', 'Alokasi Waktu', 'Keterangan']
    ];
    hasil.forEach((r, i) => aoa.push([i + 1, r.tp, r.materiPokok, r.alokasi, r.keterangan]));
    aoa.push([`TOTAL ALoKASI: ${totalJp} JP`]);
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!cols'] = [{ wch: 5 }, { wch: 80 }, { wch: 40 }, { wch: 12 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ATP');
    XLSX.writeFile(wb, `ATP_${form.mapel}_${form.fase}.xlsx`);
    showToast('Ekspor Excel berhasil.');
  };

  const loadPdfImage = (src: string): Promise<string | null> =>
    new Promise((resolve) => {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const c = document.createElement('canvas');
            c.width = img.naturalWidth;
            c.height = img.naturalHeight;
            const ctx = c.getContext('2d');
            if (!ctx) { resolve(null); return; }
            ctx.drawImage(img, 0, 0);
            resolve(c.toDataURL('image/png'));
          } catch { resolve(null); }
        };
        img.onerror = () => resolve(null);
        img.src = src;
      } catch { resolve(null); }
    });

  const exportPdf = async () => {
    if (PRINT_LOCKED) { showToast(PRINT_LOCKED_MESSAGE); return; }
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    if (biodata.logo) {
      const data = await loadPdfImage(biodata.logo);
      if (data) {
        try { doc.addImage(data, 'PNG', 40, 10, 34, 34); } catch { /* abaikan */ }
      }
    }
    doc.setFontSize(14);
    doc.text('ALUR TUJUAN PEMBELAJARAN (ATP)', doc.internal.pageSize.getWidth() / 2, 34, { align: 'center' });
    doc.setFontSize(9);
    doc.text(`${biodata.namaSekolah || ''}   |   Mapel: ${form.mapel}   |   Fase/Kelas: ${form.fase}/${form.kelas}   |   ${form.tahunPelajaran}`, doc.internal.pageSize.getWidth() / 2, 52, { align: 'center' });
    autoTable(doc, {
      startY: 68,
      head: [['No', 'Tujuan Pembelajaran', 'Materi Pokok', 'Alokasi Waktu', 'Keterangan']],
      body: hasil.map((r, i) => [i + 1, r.tp, r.materiPokok, r.alokasi, r.keterangan]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [49, 46, 129] }
    });
    doc.save(`ATP_${form.mapel}_${form.fase}.pdf`);
    showToast('Ekspor PDF berhasil.');
  };

  const exportHtml = (): string => {
    const rowsHtml = hasil.map((r, i) =>
      `<tr><td style="border:1px solid #94a3b8;padding:4px;">${i + 1}</td><td style="border:1px solid #94a3b8;padding:4px;">${esc(r.tp)}</td><td style="border:1px solid #94a3b8;padding:4px;">${esc(r.materiPokok)}</td><td style="border:1px solid #94a3b8;padding:4px;">${esc(r.alokasi)}</td><td style="border:1px solid #94a3b8;padding:4px;">${esc(r.keterangan)}</td></tr>`
    ).join('');
    return `<h3 style="text-align:center;margin-bottom:4px;">ALUR TUJUAN PEMBELAJARAN (ATP)</h3>
      <p style="text-align:center;font-size:11px;margin-top:0;">${esc(biodata.namaSekolah || '')} | Mapel: ${esc(form.mapel)} | Fase/Kelas: ${esc(form.fase)}/${esc(form.kelas)} | ${esc(form.tahunPelajaran)}</p>
      <table border="1" cellpadding="6" style="border-collapse:collapse;width:100%;font-size:10px;">
        <tr style="background:#eef2ff;"><th style="border:1px solid #94a3b8;padding:4px;">No</th><th style="border:1px solid #94a3b8;padding:4px;">Tujuan Pembelajaran</th><th style="border:1px solid #94a3b8;padding:4px;">Materi Pokok</th><th style="border:1px solid #94a3b8;padding:4px;">Alokasi Waktu</th><th style="border:1px solid #94a3b8;padding:4px;">Keterangan</th></tr>
        ${rowsHtml}
      </table>
      <p style="font-size:10px;"><b>TOTAL ALOKASI WAKTU: ${totalJp} JP</b> (tersedia ${alokasiTersedia} JP)</p>`;
  };

  const exportText = (): string => {
    const head = ['No', 'Tujuan Pembelajaran', 'Materi Pokok', 'Alokasi Waktu', 'Keterangan'].join('\t');
    const body = hasil.map((r, i) => [i + 1, r.tp, r.materiPokok, r.alokasi, r.keterangan].join('\t')).join('\n');
    return `ALUR TUJUAN PEMBELAJARAN (ATP)\nSekolah: ${biodata.namaSekolah} | Mapel: ${form.mapel} | Fase/Kelas: ${form.fase}/${form.kelas} | ${form.tahunPelajaran}\n\n${head}\n${body}\n\nTOTAL ALOKASI WAKTU: ${totalJp} JP (tersedia ${alokasiTersedia} JP)`;
  };

  const esc = (s: string): string => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const download = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const fallbackCopy = (text: string) => {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch { /* ok */ }
    document.body.removeChild(ta);
  };

  const totalJp = hasil.reduce((acc, r) => acc + (parseInt(r.alokasi) || 0), 0);
  const alokasiTersedia = (parseInt(form.mingguEfektif) || 0) * (parseInt(form.jamPerMinggu) || 0);
  const selisih = alokasiTersedia - totalJp;
  const statusAlokasi = hasil.length === 0 ? 'kosong' : selisih < 0 ? 'lebih' : selisih > 0 ? 'kurang' : 'sesuai';

  const redundan: number[][] = [];
  hasil.forEach((a, i) => hasil.forEach((b, j) => {
    if (i < j && levelOf(a.kompetensi) === levelOf(b.kompetensi)) {
      const sameK = a.kompetensi.slice().sort().join('|').toLowerCase() === b.kompetensi.slice().sort().join('|').toLowerCase();
      if (sameK && a.tp.trim().toLowerCase() !== b.tp.trim().toLowerCase()) redundan.push([i, j]);
    }
  }));
  const redundanPairs = redundan.slice(0, 1);

  const cek = useMemo(() => {
    const semuaDariCP = hasil.length > 0 && hasil.every((r) => r.cp.trim());
    const gradasi = new Set(hasil.map((r) => levelOf(r.kompetensi))).size > 1;
    let berkesinambungan = true;
    for (let i = 1; i < hasil.length; i++) {
      if (levelOf(hasil[i].kompetensi) < levelOf(hasil[i - 1].kompetensi)) { berkesinambungan = false; break; }
    }
    const pakaiKKO = hasil.every((r) => r.kompetensi.length > 0);
    const alokasiTersedia2 = alokasiTersedia > 0 && totalJp <= alokasiTersedia;
    const tidakRedundan = redundanPairs.length === 0;
    const sesuaiFase = Boolean(form.fase && form.kelas && hasil.length > 0);
    const items = { semuaDariCP, berkesinambungan, gradasi, pakaiKKO, alokasiTersedia2, tidakRedundan, sesuaiFase };
    const skor = Math.round((Object.values(items).filter(Boolean).length / 7) * 100);
    return { ...items, skor };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasil, form.fase, form.kelas, alokasiTersedia, totalJp, redundanPairs.length]);

  return (
    <div id="tab-atp" className="tab-content space-y-4">

      {/* 1. EKSPOR & UNDUH */}
      <Card no="1" title="Ekspor &amp; Unduh" icon={<FileDown className="w-4 h-4 text-amber-300" />} right={
        <Btn tone="ghost" onClick={() => setPanduanOpen((v) => !v)}><HelpCircle className="w-3.5 h-3.5" /><span>Panduan</span></Btn>
      }>
        {panduanOpen && (
          <div className="text-[11px] text-slate-700 bg-indigo-50 border border-indigo-100 rounded-xl p-3 leading-relaxed">
            <b className="text-indigo-900">Panduan:</b> 1) Periksa Data Pembelajaran (otomatis dari Biodata/CP). 2) Pilih TP dari Database TP atau Input Manual, lalu tekan <b>Masukkan ke ATP</b>. 3) Atur Urutan, Pola Kesinambungan, dan Alokasi Waktu. 4) Tekan <b>✨ ANALISIS &amp; GENERATE ATP</b> untuk menyusun alur otomatis. 5) Validasi hasil &amp; pada bagian bawah sediakan ekspor ke Word/Excel/PDF/Cetak.
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <Btn tone="ghost" onClick={copyToClipboard}><ClipboardCopy className="w-3.5 h-3.5" /><span>Salin ke Clipboard</span></Btn>
          <Btn tone="ghost" onClick={exportWord}><FileType className="w-3.5 h-3.5" /><span>Export Word</span></Btn>
          <Btn tone="ghost" onClick={exportExcel}><FileSpreadsheet className="w-3.5 h-3.5" /><span>Export Excel</span></Btn>
          <Btn tone="ghost" onClick={exportPdf}><FileDown className="w-3.5 h-3.5" /><span>Export PDF</span></Btn>
          <Btn onClick={triggerPrint}><Printer className="w-3.5 h-3.5" /><span>Cetak</span></Btn>
          {onNavigateToRpm && <Btn tone="amber" onClick={onNavigateToRpm}><BookOpen className="w-3.5 h-3.5" /><span>Lanjut ke RPM/Modul Ajar</span></Btn>}
        </div>
        <p className="text-[10px] text-slate-400 font-medium">Terintegrasi: CP → Generator Analisis TP → Tujuan Pembelajaran → Generator ATP → Alur Tujuan Pembelajaran → Modul Ajar/RPP.</p>
      </Card>

      {/* 2. DATA PEMBELAJARAN */}
      <Card no="2" title="Data Pembelajaran" icon={<Settings className="w-4 h-4 text-amber-300" />}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Label text="Fase"><Input value={form.fase} readOnly title="Otomatis dari Biodata" /></Label>
          <Label text="Kelas"><Input value={form.kelas} readOnly title="Otomatis dari Biodata" /></Label>
          <Label text="Mata Pelajaran">
            <Select value={form.mapel} onChange={(e) => handleMapelChange(e.target.value)}>
              {ATP_SUBJECTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
          </Label>
          <Label text="Semester"><Input value={form.semester} onChange={(e) => set('semester', e.target.value)} /></Label>
          <Label text="Tahun Pelajaran"><Input value={form.tahunPelajaran} onChange={(e) => set('tahunPelajaran', e.target.value)} /></Label>
          <Label text="Alokasi Minggu Efektif"><Input type="number" value={form.mingguEfektif} onChange={(e) => set('mingguEfektif', e.target.value)} /></Label>
          <Label text="Jam Pelajaran per Minggu"><Input type="number" value={form.jamPerMinggu} onChange={(e) => set('jamPerMinggu', e.target.value)} /></Label>
          <Label text="Satuan Pendidikan"><Input value={form.satuanPendidikan} onChange={(e) => set('satuanPendidikan', e.target.value)} /></Label>
        </div>
      </Card>

      {/* 3. TUJUAN PEMBELAJARAN */}
      <Card no="3" title="Tujuan Pembelajaran" icon={<FileText className="w-4 h-4 text-amber-300" />} right={
        <Btn tone="amber" onClick={masukkanKeATP}><ArrowRight className="w-3.5 h-3.5" /><span>Masukkan ke ATP</span></Btn>
      }>
        {cpAcuan && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-indigo-800 mb-1">Capaian Pembelajaran ({form.fase}) — {form.mapel}</p>
            <p className="text-[11px] leading-relaxed text-slate-700 italic">{cpAcuan}</p>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setTpMode('db')} className={`px-3 py-2 rounded-xl text-[11px] font-bold border transition cursor-pointer ${tpMode === 'db' ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}><ClipboardList className="inline w-3.5 h-3.5 mr-1" />Pilih dari Database TP</button>
          <button onClick={() => setTpMode('manual')} className={`px-3 py-2 rounded-xl text-[11px] font-bold border transition cursor-pointer ${tpMode === 'manual' ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}><Pencil className="inline w-3.5 h-3.5 mr-1" />Input TP Manual</button>
        </div>

        {tpMode === 'db' ? (
          <>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-[11px] text-slate-600 font-semibold">Pilih TP yang telah disusun di Generator TP ({pool.length} tersedia):</p>
              <button onClick={pilihSemua} className="text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition cursor-pointer">
                <CheckCircle2 className="inline w-3.5 h-3.5 mr-1" />Pilih Semua
              </button>
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-700">
                    <th className="px-2 py-1.5 text-center w-10">Pilih</th>
                    <th className="px-2 py-1.5 text-center w-10">No</th>
                    <th className="px-2 py-1.5 text-left">Tujuan Pembelajaran</th>
                  </tr>
                </thead>
                <tbody>
                  {pool.map((p, i) => (
                    <tr key={p.id} className="border-t border-slate-100">
                      <td className="px-2 py-1 text-center">
                        <input type="checkbox" checked={pilihIds.has(p.id)} onChange={() => togglePilih(p.id)} className="accent-indigo-600 w-3.5 h-3.5 cursor-pointer" />
                      </td>
                      <td className="px-2 py-1 text-center font-bold">{i + 1}</td>
                      <td className="px-2 py-1">{p.tp}</td>
                    </tr>
                  ))}
                  {pool.length === 0 && <tr><td colSpan={3} className="px-2 py-3 text-center text-slate-400">Database TP kosong untuk mapel ini.</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <p className="text-[11px] text-slate-600 font-semibold">Tulis satu Tujuan Pembelajaran per baris:</p>
            <textarea rows={5} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y" value={manualText} onChange={(e) => setManualText(e.target.value)} placeholder={'Peserta didik mampu mengidentifikasi...\nPeserta didik mampu menjelaskan...\nPeserta didik mampu membandingkan...'} />
          </div>
        )}
      </Card>

      {/* 4. PENGATURAN ATP */}
      <Card no="4" title="Pengaturan ATP" icon={<Settings className="w-4 h-4 text-amber-300" />}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Label text="Urutan Penyusunan">
            <Select value={form.urutan} onChange={(e) => set('urutan', e.target.value)}>
              {ORDERS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </Select>
          </Label>
          <Label text="Pola Kesinambungan TP">
            <Select value={form.pola} onChange={(e) => set('pola', e.target.value)}>
              {POLAS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </Select>
          </Label>
          <Label text="Alokasi Waktu">
            <Select value={form.alokasiMode} onChange={(e) => set('alokasiMode', e.target.value)}>
              <option value="otomatis">Otomatis</option>
              <option value="manual">Manual</option>
            </Select>
          </Label>
        </div>
        <p className="text-[10px] text-slate-400 font-medium italic">ATP disusun dengan mempertimbangkan kesinambungan antartujuan pembelajaran, gradasi kompetensi, keluasan materi, dan alokasi waktu.</p>
      </Card>

      {/* TOMBOL GENERATE */}
      <div className="no-print">
        <button onClick={() => { if (isLocked()) return; doGenerate(); }} className="w-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white text-base font-black uppercase tracking-widest py-4 rounded-2xl shadow-lg transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center space-x-2">
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span>✨ Analisis &amp; Generate ATP</span>
        </button>
      </div>

      {/* 5. HASIL ATP */}
      <Card no="5" title="Hasil Alur Tujuan Pembelajaran" icon={<ListChecks className="w-4 h-4 text-amber-300" />} right={
        <div className="flex space-x-1.5">
          <Btn tone="ghost" onClick={regenerate}><RotateCcw className="w-3.5 h-3.5" /><span>Regenerate</span></Btn>
          <Btn tone="emerald" onClick={simpanHasil}><Save className="w-3.5 h-3.5" /><span>Simpan Hasil</span></Btn>
        </div>
      }>
        <p className="text-[11px] text-slate-600 font-semibold">Hasil ATP ({hasil.length} TP) — klik ✏️ untuk edit, 🗑️ hapus, ↕️ ubah urutan:</p>
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-[10px] border-collapse">
            <thead>
              <tr className="bg-indigo-900 text-white">
                <th className="px-1.5 py-1.5 text-center w-8">No</th>
                <th className="px-2 py-1.5 text-left w-[34%]">Tujuan Pembelajaran</th>
                <th className="px-2 py-1.5 text-left w-[28%]">Materi Pokok</th>
                <th className="px-1.5 py-1.5 text-center w-[9%]">Alokasi Waktu</th>
                <th className="px-1.5 py-1.5 text-center w-[12%]">Keterangan</th>
                <th className="px-1.5 py-1.5 text-center w-24 no-print">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {hasil.map((r, i) => (
                <tr key={r.id} className="border-t border-slate-100 align-top">
                  <td className="px-1.5 py-1 text-center font-bold">{i + 1}</td>
                  <td className="px-1.5 py-1">
                    <textarea rows={2} className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none no-print" value={r.tp} onChange={(e) => editCell(r.id, 'tp', e.target.value)} />
                    <span className="hidden print:inline whitespace-pre-wrap">{r.tp}</span>
                  </td>
                  <td className="px-1.5 py-1">
                    <textarea rows={2} className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none no-print" value={r.materiPokok} onChange={(e) => editCell(r.id, 'materiPokok', e.target.value)} />
                    <span className="hidden print:inline whitespace-pre-wrap">{r.materiPokok}</span>
                  </td>
                  <td className="px-1.5 py-1 text-center">
                    <input type="text" className="w-16 bg-slate-50 border border-slate-200 rounded px-1 py-1 text-[10px] text-center font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 no-print" value={r.alokasi} onChange={(e) => editCell(r.id, 'alokasi', e.target.value)} />
                    <span className="hidden print:inline">{r.alokasi}</span>
                  </td>
                  <td className="px-1.5 py-1 text-center">
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded px-1 py-1 text-[10px] text-center focus:outline-none focus:ring-1 focus:ring-indigo-500 no-print" value={r.keterangan} onChange={(e) => editCell(r.id, 'keterangan', e.target.value)} />
                    <span className="hidden print:inline">{r.keterangan}</span>
                  </td>
                  <td className="px-1.5 py-1 no-print">
                    <div className="flex items-center justify-center space-x-0.5">
                      <button onClick={() => moveRow(r.id, -1)} className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer" title="Naik"><ChevronUp className="w-3 h-3" /></button>
                      <button onClick={() => moveRow(r.id, 1)} className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer" title="Turun"><ChevronDown className="w-3 h-3" /></button>
                      <button onClick={() => removeHasil(r.id)} className="p-1 rounded bg-rose-100 hover:bg-rose-200 text-rose-700 transition cursor-pointer" title="Hapus"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {hasil.length === 0 && (
                <tr><td colSpan={6} className="px-2 py-4 text-center text-slate-400">Belum ada hasil. Pilih TP lalu tekan ANALISIS &amp; GENERATE ATP.</td></tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-indigo-50 font-black text-indigo-900">
                <td colSpan={4} className="px-2 py-2 text-right">TOTAL ALOKASI WAKTU: {totalJp} JP</td>
                <td colSpan={2} className="px-2 py-2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* 6. VALIDASI ATP */}
      <Card no="6" title="Validasi ATP" icon={<ClipboardCheck className="w-4 h-4 text-amber-300" />} right={
        <span className="px-2.5 py-1 rounded-full bg-emerald-400 text-emerald-950 text-[10px] font-black">Kualitas ATP: {cek.skor}/100</span>
      }>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="space-y-1.5 text-[10px] font-semibold text-slate-700">
            <ValRow ok={cek.semuaDariCP} label="Semua TP berasal dari CP" />
            <ValRow ok={cek.berkesinambungan} label="Urutan TP berkesinambungan" />
            <ValRow ok={cek.gradasi} label="Terdapat gradasi kompetensi" />
            <ValRow ok={cek.pakaiKKO} label="Menggunakan KKO" />
            <ValRow ok={cek.alokasiTersedia2} label="Alokasi waktu tersedia" />
            <ValRow ok={cek.tidakRedundan} label="Tidak terdapat TP yang redundan" />
            <ValRow ok={cek.sesuaiFase} label="Sesuai fase dan kelas" />
          </div>
          <div className="space-y-2">
            {redundanPairs.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-[10px] text-amber-800 font-semibold flex items-start space-x-2">
                <AlarmClock className="w-4 h-4 mt-0.5" />
                <span>⚠️ TP {redundanPairs[0][0] + 1} dan TP {redundanPairs[0][1] + 1} memiliki kompetensi yang terlalu mirip.</span>
              </div>
            )}
            {!cek.berkesinambungan && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-[10px] text-amber-800 font-semibold">⚠️ Urutan TP belum berkesinambungan.</div>
            )}
            <div className="flex justify-end">
              <Btn tone="amber" onClick={perbaikiOtomatis}><Wand2 className="w-3.5 h-3.5" /><span>Perbaiki Otomatis</span></Btn>
            </div>
          </div>
        </div>
      </Card>

      {/* 7. TOTAL ALOKASI WAKTU */}
      <Card no="7" title="Total Alokasi Waktu" icon={<AlarmClock className="w-4 h-4 text-amber-300" />}>
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-slate-800">
          <span>TOTAL ALOKASI WAKTU: <b className="text-indigo-900 text-base">{totalJp} JP</b></span>
          <span className="text-slate-400">|</span>
          <span>Alokasi tersedia: <b>{alokasiTersedia} JP</b> ({form.mingguEfektif} minggu × {form.jamPerMinggu} JP)</span>
          <StatusBadge status={statusAlokasi} />
        </div>
      </Card>

      {/* CETAKAN A4 */}
      <div className="hidden print:block print-atp-sheet">
        <div className="flex justify-center items-center text-center border-b-2 border-slate-800 pb-3">
          {biodata.logo && <img src={biodata.logo} className="print-kop-logo max-h-16 object-contain mr-3 shrink-0" alt="Logo Sekolah" />}
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 uppercase tracking-wide">Alur Tujuan Pembelajaran (ATP)</h1>
            <p className="text-[11px] font-semibold text-slate-600">{biodata.namaSekolah || '-'}</p>
            <p className="text-[10px] text-slate-500">{biodata.alamat}, {biodata.kota}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-10 gap-y-1 text-[11px] font-semibold text-slate-800 my-3">
          <div className="flex"><span className="w-28">Mata Pelajaran</span><span className="mr-2">:</span><span className="flex-1 border-b border-dashed border-slate-400 pb-0.5">{form.mapel}</span></div>
          <div className="flex"><span className="w-28">Fase / Kelas</span><span className="mr-2">:</span><span className="flex-1 border-b border-dashed border-slate-400 pb-0.5">{form.fase} / {form.kelas}</span></div>
          <div className="flex"><span className="w-28">Semester</span><span className="mr-2">:</span><span className="flex-1 border-b border-dashed border-slate-400 pb-0.5">{form.semester}</span></div>
          <div className="flex"><span className="w-28">Tahun Pelajaran</span><span className="mr-2">:</span><span className="flex-1 border-b border-dashed border-slate-400 pb-0.5">{form.tahunPelajaran}</span></div>
        </div>
        {cpAcuan && (
          <div className="mb-3 text-[10px] text-slate-800">
            <p className="font-black uppercase tracking-wider">Capaian Pembelajaran ({form.fase})</p>
            <p className="italic leading-relaxed">{cpAcuan}</p>
          </div>
        )}
        <table className="w-full border-collapse text-[10px]">
          <thead>
            <tr className="bg-indigo-900 text-white">
              <th className="border border-indigo-800 px-1 py-1 text-center w-8">No</th>
              <th className="border border-indigo-800 px-2 py-1 text-left w-[38%]">Tujuan Pembelajaran</th>
              <th className="border border-indigo-800 px-2 py-1 text-left w-[28%]">Materi Pokok</th>
              <th className="border border-indigo-800 px-1 py-1 text-center w-[9%]">Alokasi</th>
              <th className="border border-indigo-800 px-1 py-1 text-center w-[12%]">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {hasil.map((r, i) => (
              <tr key={r.id} className="align-top">
                <td className="border border-slate-300 px-1 py-1 text-center font-bold">{i + 1}</td>
                <td className="border border-slate-300 px-2 py-1 whitespace-pre-wrap">{r.tp || '-'}</td>
                <td className="border border-slate-300 px-2 py-1 whitespace-pre-wrap">{r.materiPokok || '-'}</td>
                <td className="border border-slate-300 px-1 py-1 text-center">{r.alokasi || '-'}</td>
                <td className="border border-slate-300 px-1 py-1 text-center">{r.keterangan || '-'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-indigo-50 font-bold">
              <td colSpan={4} className="border border-slate-300 px-2 py-1 text-right">TOTAL ALOKASI WAKTU: {totalJp} JP</td>
              <td className="border border-slate-300 px-1 py-1"></td>
            </tr>
          </tfoot>
        </table>
        <div className="grid grid-cols-2 gap-10 text-center text-[11px] mt-8">
          <div>
            <p className="font-semibold text-slate-700">Mengetahui,</p>
            <p className="font-semibold text-slate-700">Kepala Sekolah</p>
            <div className="mt-16"><p className="font-bold text-slate-800">{biodata.namaKepsek || '........................................'}</p><p className="font-semibold text-slate-600">NIP. {biodata.nipKepsek || '........................................'}</p></div>
          </div>
          <div>
            <p className="font-semibold text-slate-700">{biodata.desa && biodata.desa.trim() ? `${biodata.desa.trim()}, ` : ''}{dataDate()}</p>
            <p className="font-semibold text-slate-700">Guru Mata Pelajaran</p>
            <div className="mt-16"><p className="font-extrabold text-slate-900">{biodata.namaGuru || '........................................'}</p><p className="font-semibold text-slate-600">NIP. {biodata.nipGuru || '........................................'}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ValRow: React.FC<{ ok: boolean; label: string }> = ({ ok, label }) => (
  <div className="flex items-center justify-between gap-2">
    <span>{label}</span>
    {ok ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <X className="w-4 h-4 text-rose-500 shrink-0" />}
  </div>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, { text: string; cls: string }> = {
    sesuai: { text: '🟢 Alokasi sesuai', cls: 'bg-emerald-100 text-emerald-800' },
    lebih: { text: '🔴 Alokasi melebihi waktu tersedia', cls: 'bg-rose-100 text-rose-800' },
    kurang: { text: '🟡 Masih terdapat waktu yang belum dialokasikan', cls: 'bg-amber-100 text-amber-800' },
    kosong: { text: '— Belum ada TP', cls: 'bg-slate-100 text-slate-500' }
  };
  const s = map[status] || map.kosong;
  return <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${s.cls}`}>{s.text}</span>;
};

const dataDate = (): string => {
  try {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  } catch {
    return '';
  }
};