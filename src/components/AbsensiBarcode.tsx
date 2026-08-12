import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Html5Qrcode } from 'html5-qrcode';
import { Biodata } from '../types';
import {
  X,
  Download,
  Printer,
  Camera,
  ScanLine,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Share2,
  UserRound,
  CalendarCheck2,
  RefreshCw
} from 'lucide-react';

export interface BarcodeStudent {
  id: number;
  nama: string;
  nisn?: string;
}

// Kode unik QR = "ABS-{idSiswa}" (id internal siswa dari Buku Nilai)
export const barcodeCodeOf = (st: BarcodeStudent) => `ABS-${st.id}`;

export const parseBarcodeCode = (text: string): number | null => {
  const m = /^ABS-(\d+)$/.exec((text || '').trim());
  return m ? parseInt(m[1], 10) : null;
};

/* ============ Gambar Kartu QR Code (Canvas) ============ */
const loadCardLogo = (src: string): Promise<HTMLImageElement | null> =>
  new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    } catch { resolve(null); }
  });

const buildCardBlob = async (student: BarcodeStudent, biodata: Biodata, kelas: string): Promise<Blob> => {
  const canvas = document.createElement('canvas');
  canvas.width = 620;
  canvas.height = 250;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 620, 250);

  ctx.strokeStyle = '#1e1b4b';
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, 608, 238);

  if (biodata.logo) {
    const logo = await loadCardLogo(biodata.logo);
    if (logo) ctx.drawImage(logo, 18, 18, 48, 48);
  }

  ctx.fillStyle = '#1e1b4b';
  ctx.font = 'bold 20px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText((biodata.namaSekolah || 'SEKOLAH').toUpperCase(), 310, 50);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 28px Arial, sans-serif';
  ctx.fillText(student.nama, 310, 100);

  ctx.font = '15px Arial, sans-serif';
  ctx.fillText(`NISN: ${student.nisn || '-'}   |   Kelas: ${kelas || '-'}`, 310, 126);

  try {
    const qrCanvas = document.createElement('canvas');
    await QRCode.toCanvas(qrCanvas, barcodeCodeOf(student), {
      width: 170,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' }
    });
    const qw = qrCanvas.width;
    const qh = qrCanvas.height;
    const qx = Math.max(10, (620 - qw) / 2);
    ctx.drawImage(qrCanvas, qx, 140, qw, qh);

    ctx.fillStyle = '#334155';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(barcodeCodeOf(student), 310, 140 + qh + 20);
  } catch { /* abaikan */ }

  return new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob || new Blob());
    }, 'image/png');
  });
};

const downloadCard = (student: BarcodeStudent, biodata: Biodata, kelas: string) => {
  buildCardBlob(student, biodata, kelas).then((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Kartu_QR_Absen_${student.nama.replace(/\s+/g, '_')}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  });
};

const shareCard = async (student: BarcodeStudent, biodata: Biodata, kelas: string) => {
  try {
    const blob = await buildCardBlob(student, biodata, kelas);
    const file = new File([blob], `Kartu_QR_Absen_${student.nama.replace(/\s+/g, '_')}.png`, { type: 'image/png' });
    if (navigator.share) {
      await navigator.share({
        files: [file],
        title: 'Kartu QR Code Presensi',
        text: `Kartu QR presensi: ${student.nama} (${biodata.namaSekolah})`
      });
      return;
    }
  } catch (e) {
    // dibatalkan pengguna / tidak didukung browser
  }
  downloadCard(student, biodata, kelas);
};

/* ============ Komponen QR Code (preview) ============ */
export const StudentBarcode: React.FC<{ code: string; height?: number }> = ({ code, height = 70 }) => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (ref.current) {
      QRCode.toCanvas(ref.current, code, {
        width: 90,
        margin: 1,
        color: { dark: '#0f172a', light: '#ffffff' }
      }).catch(() => {});
    }
  }, [code]);
  return (
    <canvas
      ref={ref}
      className="max-w-full"
      style={{ width: height, height }}
    />
  );
};

/* ============ MODAL: DAFTAR KARTU QR CODE SISWA ============ */
interface BarcodeListModalProps {
  open: boolean;
  students: BarcodeStudent[];
  biodata: Biodata;
  kelas: string;
  onClose: () => void;
  showToast: (msg: string) => void;
  onPrintAll?: () => void;
}

export const BarcodeListModal: React.FC<BarcodeListModalProps> = ({
  open,
  students,
  biodata,
  kelas,
  onClose,
  showToast,
  onPrintAll
}) => {
  if (!open) return null;

  const printAll = () => {
    showToast('Membuka dialog cetak kartu QR code...');
    if (onPrintAll) onPrintAll();
    else window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-[300] no-print animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 mb-4 shrink-0">
          <div className="flex items-center space-x-3 text-indigo-900">
            <div className="p-2.5 bg-indigo-100 rounded-xl">
              <QrCode className="w-6 h-6 text-indigo-900" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase">Kartu QR Code Presensi Siswa</h3>
              <p className="text-xs text-slate-500">
                Unduh &amp; bagikan kartu QR per siswa. Guru memindai kartu untuk mengisi kehadiran otomatis.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 shrink-0">
          <p className="text-xs font-bold text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
            <UserRound className="w-3.5 h-3.5 inline-block mr-1 text-indigo-600" />
            Total {students.length} siswa
          </p>
          <button
            onClick={printAll}
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Semua Kartu</span>
          </button>
        </div>

        {/* Grid Kartu */}
        <div className="overflow-y-auto pr-1 -mr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {students.map((st) => (
              <div
                key={st.id}
                className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs flex flex-col items-center text-center space-y-2 hover:border-indigo-300 transition"
              >
                <p className="font-extrabold text-slate-800 text-sm leading-tight">{st.nama}</p>
                <p className="text-[11px] text-slate-500">
                  NISN: <span className="font-mono font-bold text-slate-700">{st.nisn || '-'}</span>
                  <span className="mx-1">|</span> Kelas: <span className="font-bold text-slate-700">{kelas || '-'}</span>
                </p>
                <div className="bg-white border border-slate-100 rounded-lg px-2 py-1">
                  <StudentBarcode code={barcodeCodeOf(st)} height={90} />
                </div>
                <p className="font-mono text-[10px] text-slate-400 tracking-wider">{barcodeCodeOf(st)}</p>
                <div className="flex items-center gap-2 w-full">
                  <button
                    onClick={() => { downloadCard(st, biodata, kelas); showToast(`Kartu QR ${st.nama} diunduh.`); }}
                    className="flex-1 bg-indigo-900 hover:bg-indigo-950 text-white px-3 py-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh</span>
                  </button>
                  <button
                    onClick={() => { shareCard(st, biodata, kelas); }}
                    title="Bagikan ke WhatsApp / media lain"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Bagikan</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Catatan */}
        <div className="mt-4 shrink-0 bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start space-x-2 text-[11px] text-blue-900">
          <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p>
            Kartu ini bersifat rahasia. Bagikan hanya kepada siswa / wali terkait. Ketika guru memindai kartu pada menu
            Presensi, kehadiran siswa untuk tanggal hari ini otomatis terisi <strong>Hadir (H)</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

/* ============ MODAL: SCAN QR CODE KAMERA ============ */
interface BarcodeScanModalProps {
  open: boolean;
  students: BarcodeStudent[];
  onClose: () => void;
  onScan: (studentId: number, code: string, status?: string) => void;
  showToast: (msg: string) => void;
  isDemo?: boolean;
}

const STATUS = ['H', 'S', 'I', 'A'] as const;

export const BarcodeScanModal: React.FC<BarcodeScanModalProps> = ({
  open,
  students,
  onClose,
  onScan,
  showToast,
  isDemo
}) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastHandled = useRef(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const [scanStatus, setScanStatus] = useState<string>('H');
  const [manualInput, setManualInput] = useState<string>('');
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [retryNonce, setRetryNonce] = useState<number>(0);

  // ====== Inisialisasi & pemilihan kamera berlapis ======
  useEffect(() => {
    if (!open) return;
    setCameraError(null);
    setLastScanned(null);
    setScanCount(0);

    // Cek dukungan mediaDevices (tidak tersedia di konteks tidak aman / file://)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        'Perangkat tidak mendukung akses kamera di konteks ini. Jalankan aplikasi lewat localhost/HTTPS (atau aplikasi Electron), atau gunakan menu "Scan dari File / Gambar".'
      );
      setIsStarting(false);
      return;
    }

    let stopped = false;
    let startedOk = false;

    // Setiap percobaan memakai instance Html5Qrcode BARU agar tidak terjadi
    // konflik state internal jika start() sebelumnya gagal.
    const startWithConfig = (
      config: string | MediaTrackConstraints
    ): Promise<string> => {
      return new Promise((resolve) => {
        let scanner: Html5Qrcode | null = null;
        try {
          scanner = new Html5Qrcode('qr-reader-region', { verbose: false });
        } catch (e: any) {
          resolve(e?.message || String(e));
          return;
        }
        scannerRef.current = scanner;
        scanner
          .start(
            config,
            { fps: 10, qrbox: { width: 200, height: 200 } },
            (decodedText) => {
              if (stopped) return;
              const id = parseBarcodeCode(decodedText);
              if (id === null) {
                showToast('QR code tidak dikenali.');
                return;
              }
              const st = students.find((s) => s.id === id);
              if (!st) {
                showToast('Siswa tidak ditemukan di kelas ini.');
                return;
              }
              const now = Date.now();
              if (now - lastHandled.current < 1200) return; // anti dobel-scan
              lastHandled.current = now;
              setLastScanned(st.nama);
              setScanCount((c) => c + 1);
              onScan(id, decodedText, scanStatus);
            },
            () => {
              // frame error (abaikan)
            }
          )
          .then(() => {
            startedOk = true;
            resolve('');
          })
          .catch((err) => {
            // Bersihkan instance yang gagal agar bisa dicoba lagi dengan config lain
            try {
              scanner?.stop().then(() => scanner?.clear()).catch(() => {});
            } catch {
              // abaikan
            }
            resolve(err?.message || String(err));
          });
      });
    };

    const attemptStart = async () => {
      setIsStarting(true);
      let lastErr = '';

      // Langkah 1: minta izin kamera dulu agar prompt izin muncul & perangkat dikenali
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
        stream.getTracks().forEach((t) => t.stop());
      } catch (e: any) {
        lastErr = e?.name || e?.message || 'Izin kamera ditolak';
      }

      // Langkah 2: pakai API getCameras() untuk memilih kamera yang tersedia
      let camId: string | null = null;
      try {
        const cameras = await Html5Qrcode.getCameras();
        const laptopCam =
          cameras.find((c) => /back|rear|environment/i.test(c.label)) ||
          cameras[0];
        if (laptopCam) camId = laptopCam.id;
      } catch (e: any) {
        lastErr = lastErr || e?.message || String(e);
      }

      // Langkah 3: mulai scanner — kamera spesifik → user → environment → default
      let err = '';
      if (camId) {
        err = await startWithConfig(camId);
        if (!err) {
          setIsStarting(false);
          return;
        }
      }
      if (err || !camId) {
        err = await startWithConfig({ facingMode: 'user' });
        if (!err) {
          setIsStarting(false);
          return;
        }
      }
      if (err) {
        err = await startWithConfig({ facingMode: 'environment' });
        if (!err) {
          setIsStarting(false);
          return;
        }
      }
      if (err) {
        err = await startWithConfig({ width: { ideal: 640 }, height: { ideal: 480 } });
        if (!err) {
          setIsStarting(false);
          return;
        }
      }

      setIsStarting(false);
      if (!startedOk && !stopped) {
        console.warn('Kamera gagal:', lastErr, err);
        setCameraError(
          `Kamera laptop tidak dapat diakses. (${err || lastErr || 'unknown'}) — Pastikan kamera tidak dipakai aplikasi lain, izinkan akses kamera, lalu tekan "Coba Lagi", atau gunakan "Scan dari File / Gambar".`
        );
      }
    };

    // Jeda kecil agar elemen #qr-reader-region sudah ter-render & punya ukuran
    const timer = setTimeout(attemptStart, 300);

    return () => {
      stopped = true;
      clearTimeout(timer);
      const scanner = scannerRef.current;
      if (scanner) {
        scanner
          .stop()
          .then(() => scanner.clear())
          .catch(() => {});
        scannerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, students, retryNonce]);

  // ====== Scan dari file gambar (fallback bila kamera tidak ada) ======
  const handleScanFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const scanner = scannerRef.current || new Html5Qrcode('qr-reader-region', { verbose: false });
      const text = await scanner.scanFile(file, false);
      const id = parseBarcodeCode(text);
      if (id === null) {
        showToast('QR code pada gambar tidak dikenali.');
        return;
      }
      const st = students.find((s) => s.id === id);
      if (!st) {
        showToast('Siswa tidak ditemukan di kelas ini.');
        return;
      }
      setLastScanned(st.nama);
      setScanCount((c) => c + 1);
      onScan(id, text, scanStatus);
      showToast(`✅ ${st.nama} ter-absen dari gambar QR.`);
    } catch {
      showToast('Tidak dapat membaca QR dari file ini.');
    } finally {
      e.target.value = '';
    }
  };

  // ====== Fallback input manual (ketik NISN / kode ABS-x / nama) ======
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = manualInput.trim();
    if (!q) return;
    const match =
      students.find((s) => `ABS-${s.id}` === q) ||
      students.find((s) => s.nisn && s.nisn.replace(/\s+/g, '') === q.replace(/\s+/g, '')) ||
      students.find((s) => s.nama.toLowerCase() === q.toLowerCase()) ||
      students.find((s) => s.nama.toLowerCase().includes(q.toLowerCase()));
    if (!match) {
      showToast('Siswa tidak ditemukan. Periksa NISN / nama.');
      return;
    }
    setLastScanned(match.nama);
    setScanCount((c) => c + 1);
    onScan(match.id, `ABS-${match.id}`, scanStatus);
    showToast(`✅ ${match.nama} ter-absen (${scanStatus}).`);
    setManualInput('');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-[300] no-print animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
          title="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 text-indigo-900">
          <div className="p-2.5 bg-emerald-100 rounded-xl">
            <Camera className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase">Scan Kartu QR Code</h3>
            <p className="text-xs text-slate-500">Arahkan kamera ke QR code siswa</p>
          </div>
        </div>

        {/* Pemilih status kehadiran */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider shrink-0">Status:</span>
          <div className="flex gap-1.5 flex-wrap">
            {STATUS.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setScanStatus(st)}
                className={`w-9 h-9 rounded-lg text-sm font-extrabold border transition cursor-pointer ${
                  scanStatus === st
                    ? st === 'H'
                      ? 'bg-emerald-600 border-emerald-700 text-white'
                      : st === 'S'
                      ? 'bg-blue-600 border-blue-700 text-white'
                      : st === 'I'
                      ? 'bg-amber-500 border-amber-600 text-white'
                      : 'bg-rose-600 border-rose-700 text-white'
                    : 'bg-white border-slate-300 text-slate-600'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {cameraError ? (
          <div className="space-y-2">
            <div className="bg-rose-50 border border-rose-300 text-rose-800 p-4 rounded-xl text-xs font-semibold flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p>{cameraError}</p>
            </div>
            <button
              type="button"
              onClick={() => setRetryNonce((n) => n + 1)}
              className="w-full bg-indigo-900 hover:bg-indigo-950 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Coba Lagi Aktifkan Kamera</span>
            </button>
          </div>
        ) : (
          <div className="bg-black rounded-xl overflow-hidden relative">
            <div
              id="qr-reader-region"
              style={{ width: '100%', height: 250 }}
              className="flex items-center justify-center text-white/70 text-xs p-4"
            >
              <span className="flex items-center space-x-2">
                <ScanLine className={`w-4 h-4 ${isStarting ? 'animate-pulse' : ''}`} />
                <span>{isStarting ? 'Mencari kamera...' : 'Memuat kamera...'}</span>
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-2 text-center text-[10px] text-white/70 font-semibold">
              Posisikan QR code siswa di dalam kotak pemindai
            </div>
          </div>
        )}

        {/* Fallback: scan dari file gambar */}
        {!cameraError && (
          <label className="flex items-center justify-center gap-2 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer">
            <QrCode className="w-4 h-4 text-slate-500" />
            <span>Scan dari File / Gambar QR</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleScanFile}
            />
          </label>
        )}

        {lastScanned && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 flex items-start space-x-2 text-xs text-emerald-900 animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold">Terakhir dipindai: {lastScanned}</p>
              <p className="text-emerald-700">
                {scanCount} siswa ter-absen pada sesi ini (status {scanStatus}).
              </p>
            </div>
          </div>
        )}

        {/* Input manual (kamera rusak / tidak tersedia) */}
        <form onSubmit={handleManualSubmit} className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            Atau isi manual (NISN / kode ABS-x / nama siswa)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Contoh: 3123456789 atau nama siswa"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-800 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-indigo-900 hover:bg-indigo-950 text-white px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
            >
              Tandai
            </button>
          </div>
        </form>

        {isDemo && (
          <div className="bg-amber-50 border border-amber-300 text-amber-900 p-3 rounded-xl text-xs font-semibold flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>Mode Demo: pemindaian hanya menampilkan nama siswa tanpa menyimpan kehadiran.</p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center space-x-2"
        >
          <CalendarCheck2 className="w-4 h-4 text-slate-500" />
          <span>Selesai / Tutup</span>
        </button>
      </div>
    </div>
  );
};
