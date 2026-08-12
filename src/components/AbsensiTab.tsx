import React, { useState, useEffect, useMemo } from 'react';
import { Biodata, SubjectStudentGrade, StudentEvaluationGrade } from '../types';
import { loadTeacherAbsensi, saveTeacherAbsensi } from '../utils/teacherStorage';
import * as XLSX from 'xlsx';
import {
  CalendarCheck,
  Download,
  Printer,
  CheckCircle2,
  Users,
  RefreshCw,
  FileSpreadsheet,
  Info,
  Calendar,
  Sparkles,
  UserCheck,
  Lock,
  QrCode,
  Camera
} from 'lucide-react';
import {
  BarcodeListModal,
  BarcodeScanModal,
  BarcodeStudent,
  StudentBarcode,
  barcodeCodeOf
} from './AbsensiBarcode';

interface AbsensiTabProps {
  biodata: Biodata;
  subjectGradesDatabase: Record<string, SubjectStudentGrade[]>;
  gradesDatabase: Record<string, StudentEvaluationGrade[]>;
  showToast: (msg: string) => void;
  triggerPrint: (mode: 'diagnosa' | 'kktp' | 'bukunilai' | 'absensi', viewTitle?: string) => void;
  isDemo?: boolean;
}

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

// Helper to determine total days in month
const getDaysInMonth = (monthName: string) => {
  const m = monthName.toLowerCase();
  if (m === "februari") return 29; // standard max column range 31 for full grid layout
  if (["april", "juni", "september", "november"].includes(m)) return 30;
  return 31;
};

// Helper to determine day of week info (Sabtu & Minggu are weekends)
const getDayOfWeek = (day: number, monthName: string, tahunPelajaranStr: string) => {
  const mIndex = MONTHS.findIndex(m => m.toLowerCase() === monthName.toLowerCase());
  if (mIndex === -1) return { isWeekend: false, dayOfWeek: -1, dayShort: '', dayFull: '', year: 2026 };

  const matches = tahunPelajaranStr.match(/\d{4}/g);
  let startYear = 2025;
  let endYear = 2026;
  if (matches && matches.length >= 2) {
    startYear = parseInt(matches[0], 10);
    endYear = parseInt(matches[1], 10);
  } else if (matches && matches.length === 1) {
    startYear = parseInt(matches[0], 10);
    endYear = startYear;
  }

  // Juli - Desember (index 6..11) belong to startYear, Januari - Juni (index 0..5) belong to endYear
  const year = mIndex >= 6 ? startYear : endYear;
  const date = new Date(year, mIndex, day);
  const dayOfWeek = date.getDay(); // 0 = Minggu (Sun), 6 = Sabtu (Sat)

  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const dayShortNames = ["M", "S", "S", "R", "K", "J", "S"]; // Minggu, Senin, Selasa, Rabu, Kamis, Jumat, Sabtu
  const dayFullNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  return {
    isWeekend,
    isSabtu: dayOfWeek === 6,
    isMinggu: dayOfWeek === 0,
    dayOfWeek,
    dayShort: dayShortNames[dayOfWeek],
    dayFull: dayFullNames[dayOfWeek],
    year
  };
};

export const AbsensiTab: React.FC<AbsensiTabProps> = ({
  biodata,
  subjectGradesDatabase,
  gradesDatabase,
  showToast,
  triggerPrint,
  isDemo
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>("Agustus");
  const [tahunPelajaran, setTahunPelajaran] = useState<string>("2025/2026");
  const [selectedClass, setSelectedClass] = useState<string>(biodata.kelas || "III");

  // Local state for attendance records: key `${month}_${studentId}_${day}` -> 'H' | 'S' | 'I' | 'A' | ''
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>(() => {
    try {
      return loadTeacherAbsensi(biodata.nipGuru);
    } catch {
      return {};
    }
  });

  // Modal Barcode
  const [showBarcodeModal, setShowBarcodeModal] = useState<boolean>(false);
  const [showScanModal, setShowScanModal] = useState<boolean>(false);
  const [autoScanTriggered, setAutoScanTriggered] = useState<boolean>(false);

  // ================= ALGORITMA BUKA KAMERA OTOMATIS =================
  // Saat menu Presensi dibuka, modal kamera langsung terbuka otomatis sehingga
  // guru tinggal mengarahkan kamera ke kartu QR yang dipegang siswa.
  // Hanya dipicu sekali per kunjungan ke menu ini (agar tidak mengganggu
  // saat guru sedang melihat tabel presensi / mengubah pengaturan).
  useEffect(() => {
    if (autoScanTriggered) return;
    // Beri jeda singkat agar menu Presensi selesai dirender dulu.
    const timer = setTimeout(() => {
      setShowScanModal(true);
      setAutoScanTriggered(true);
    }, 700);
    return () => clearTimeout(timer);
  }, [autoScanTriggered]);

  // Save to localStorage whenever attendanceData changes
  useEffect(() => {
    try {
      saveTeacherAbsensi(biodata.nipGuru, attendanceData);
    } catch {
      // ignore quota errors
    }
  }, [attendanceData, biodata.nipGuru]);

  // Keep class name in sync if biodata changes
  useEffect(() => {
    if (biodata.kelas) {
      setSelectedClass(biodata.kelas);
    }
  }, [biodata.kelas]);

  // Dynamically retrieve student list from Buku Nilai (subjectGradesDatabase or gradesDatabase)
  const students = useMemo(() => {
    const map = new Map<number, { id: number; nama: string; nisn: string }>();

    // 1. Gather from subjectGradesDatabase
    Object.keys(subjectGradesDatabase).forEach(sub => {
      (subjectGradesDatabase[sub] || []).forEach(s => {
        if (s && s.id && s.nama) {
          if (!map.has(s.id)) {
            map.set(s.id, { id: s.id, nama: s.nama, nisn: s.nisn || '' });
          } else {
            // update name if changed
            const existing = map.get(s.id)!;
            existing.nama = s.nama;
            existing.nisn = s.nisn || existing.nisn;
          }
        }
      });
    });

    // 2. Gather from gradesDatabase
    Object.keys(gradesDatabase).forEach(sub => {
      (gradesDatabase[sub] || []).forEach(s => {
        if (s && s.id && s.nama) {
          if (!map.has(s.id)) {
            map.set(s.id, { id: s.id, nama: s.nama, nisn: s.nisn || '' });
          } else {
            const existing = map.get(s.id)!;
            existing.nama = s.nama;
          }
        }
      });
    });

    // Return list sorted by ID so row order matches Buku Nilai (No. 1, 2, 3...)
    return Array.from(map.values()).sort((a, b) => a.id - b.id);
  }, [subjectGradesDatabase, gradesDatabase]);

  // Max days display is 31 (matching the grid screenshot)
  const daysArray = Array.from({ length: 31 }, (_, i) => i + 1);
  const activeDays = getDaysInMonth(selectedMonth);

  // Toggle cell attendance status
  const toggleAttendance = (studentId: number, day: number) => {
    if (isDemo) {
      showToast("🔒 Mode Demo: Anda hanya dapat melihat data presensi tanpa mengedit.");
      return;
    }
    const key = `${selectedMonth}_${studentId}_${day}`;
    const current = attendanceData[key] || '';
    let next = '';
    if (current === '') next = 'H';
    else if (current === 'H') next = 'S';
    else if (current === 'S') next = 'I';
    else if (current === 'I') next = 'A';
    else next = '';

    setAttendanceData(prev => ({ ...prev, [key]: next }));
  };

  // Set individual cell status directly
  const setCellAttendance = (studentId: number, day: number, status: string) => {
    const key = `${selectedMonth}_${studentId}_${day}`;
    setAttendanceData(prev => ({ ...prev, [key]: status }));
  };

  // ================= ALGORITMA SCAN QR -> ISI ABSENSI OTOMATIS =================
  // Alur: (1) guru membuka modal Scan QR, (2) siswa mendekatkan kartu QR-nya ke kamera,
  // (3) QR di-decode menjadi kode "ABS-{id}", (4) sistem mencocokkan id dengan daftar siswa,
  // (5) kehadiran siswa tersebut otomatis diisi sesuai status terpilih untuk tanggal hari ini,
  // (6) tampilan bulan otomatis pindah ke bulan hari ini agar hasilnya langsung terlihat.
  const handleBarcodeScanned = (studentId: number, code: string, status = 'H') => {
    // Langkah 0: Mode demo hanya menampilkan, tidak menyimpan.
    if (isDemo) {
      showToast("🔒 Mode Demo: scan QR hanya menampilkan siswa tanpa menyimpan kehadiran.");
      return;
    }

    // Langkah 1: Tentukan "hari ini" dari jam sistem (tanggal, bulan, tahun).
    const today = new Date();
    const day = today.getDate();
    const targetMonth = MONTHS[today.getMonth()]; // nama bulan hari ini
    const targetYear = today.getFullYear();

    // Langkah 2: Cari siswa pemegang QR berdasarkan id hasil decode.
    const st = students.find(s => s.id === studentId);
    if (!st) {
      showToast("⚠️ Siswa tidak ditemukan di kelas ini. Periksa kembali kartu QR.");
      return;
    }

    // Langkah 3: Lewati hari libur (Sabtu/Minggu) — tidak ada sekolah.
    const dayInfo = getDayOfWeek(day, targetMonth, `${targetYear - 1}/${targetYear}`);
    if (dayInfo.isWeekend) {
      showToast(`📅 Hari ini (${dayInfo.dayFull}) libur — kehadiran ${st.nama} tidak diisi.`);
      return;
    }

    // Langkah 4: Simpan kehadiran pada kunci "bulan_id_hari" dengan status terpilih.
    // Dipakai targetMonth (bulan hari ini), bukan selectedMonth, agar data selalu benar.
    const key = `${targetMonth}_${studentId}_${day}`;
    setAttendanceData(prev => {
      const next = { ...prev, [key]: status };
      return next;
    });

    // Langkah 5: Pindahkan tampilan tabel ke bulan hari ini agar hasil langsung terlihat.
    if (selectedMonth !== targetMonth) {
      setSelectedMonth(targetMonth);
    }

    // Langkah 6: Konfirmasi hasil ke guru.
    const statusLabel: Record<string, string> = { H: 'Hadir', S: 'Sakit', I: 'Izin', A: 'Alpa' };
    showToast(`✅ ${st.nama} ter-absen ${statusLabel[status] || status} (${status}) — ${day} ${targetMonth} ${dayInfo.year}.`);
  };

  // Mark all students as Hadir for non-weekend active days of the month
  const markAllHadirMonth = () => {
    const newRecords = { ...attendanceData };
    students.forEach(st => {
      for (let d = 1; d <= activeDays; d++) {
        const dayInfo = getDayOfWeek(d, selectedMonth, tahunPelajaran);
        if (dayInfo.isWeekend) continue; // Skip Saturday and Sunday
        const key = `${selectedMonth}_${st.id}_${d}`;
        // Only set if empty
        if (!newRecords[key]) {
          newRecords[key] = 'H';
        }
      }
    });
    setAttendanceData(newRecords);
    showToast(`Semua hari kerja (Senin-Jumat) bulan ${selectedMonth} telah diisi Hadir (H).`);
  };

  // Clear current month attendance
  const resetMonthAttendance = () => {
    setAttendanceData(prev => {
      const copy = { ...prev };
      students.forEach(st => {
        for (let d = 1; d <= 31; d++) {
          delete copy[`${selectedMonth}_${st.id}_${d}`];
        }
      });
      return copy;
    });
    showToast(`Presensi bulan ${selectedMonth} telah direset.`);
  };

  // Calculate monthly stats per student
  const getStudentStats = (studentId: number) => {
    let s = 0, i = 0, a = 0, h = 0;
    for (let d = 1; d <= 31; d++) {
      const val = attendanceData[`${selectedMonth}_${studentId}_${d}`];
      if (val === 'S') s++;
      else if (val === 'I') i++;
      else if (val === 'A') a++;
      else if (val === 'H') h++;
    }
    return { s, i, a, h };
  };

  // Calculate overall class summary for current month
  const classSummary = useMemo(() => {
    let totalS = 0, totalI = 0, totalA = 0, totalH = 0;
    students.forEach(st => {
      for (let d = 1; d <= 31; d++) {
        const val = attendanceData[`${selectedMonth}_${st.id}_${d}`];
        if (val === 'S') totalS++;
        else if (val === 'I') totalI++;
        else if (val === 'A') totalA++;
        else if (val === 'H') totalH++;
      }
    });
    return { totalS, totalI, totalA, totalH };
  }, [students, attendanceData, selectedMonth]);

  // EXPORT TO EXCEL matching the exact uploaded image format
  const exportToExcel = () => {
    const monthUpper = selectedMonth.toUpperCase();
    const kelasUpper = selectedClass.toUpperCase();

    // Array of Arrays
    const aoa: (string | number)[][] = [
      ["DAFTAR HADIR SISWA SD"],
      [`TAHUN PELAJARAN ${tahunPelajaran}`],
      [`BULAN : ${monthUpper}`],
      [],
      [`KELAS : ${kelasUpper}`],
      [],
      // Row 6: Header 1
      ["No", "Nama Siswa", "Tanggal", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "Jumlah", "", ""],
      // Row 7: Header 2 (Days 1..31 and S, I, A)
      ["", "", ...daysArray, "S", "I", "A"]
    ];

    // Student rows
    students.forEach((st, idx) => {
      const stats = getStudentStats(st.id);
      const row: (string | number)[] = [idx + 1, st.nama];

      daysArray.forEach(d => {
        const dayInfo = getDayOfWeek(d, selectedMonth, tahunPelajaran);
        if (d > activeDays) {
          row.push("");
        } else if (dayInfo.isWeekend) {
          row.push("L");
        } else {
          const val = attendanceData[`${selectedMonth}_${st.id}_${d}`] || '';
          row.push(val);
        }
      });

      row.push(stats.s > 0 ? stats.s : "");
      row.push(stats.i > 0 ? stats.i : "");
      row.push(stats.a > 0 ? stats.a : "");

      aoa.push(row);
    });

    const ws = XLSX.utils.aoa_to_sheet(aoa);

    // Merges according to standard screenshot format
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 35 } }, // Title 1
      { s: { r: 1, c: 0 }, e: { r: 1, c: 35 } }, // Title 2 (Tahun Pelajaran)
      { s: { r: 2, c: 0 }, e: { r: 2, c: 35 } }, // Title 3 (Bulan)
      { s: { r: 6, c: 0 }, e: { r: 7, c: 0 } }, // No
      { s: { r: 6, c: 1 }, e: { r: 7, c: 1 } }, // Nama Siswa
      { s: { r: 6, c: 2 }, e: { r: 6, c: 32 } }, // Tanggal (1..31)
      { s: { r: 6, c: 33 }, e: { r: 6, c: 35 } }, // Jumlah (S, I, A)
    ];

    // Column Widths
    const colWidths = [
      { wch: 6 },  // No
      { wch: 32 }, // Nama Siswa
    ];
    for (let d = 1; d <= 31; d++) {
      colWidths.push({ wch: 4.5 }); // Days 1..31
    }
    colWidths.push({ wch: 6 }, { wch: 6 }, { wch: 6 }); // S, I, A

    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Daftar_Hadir");
    XLSX.writeFile(wb, `Daftar_Hadir_Siswa_Kelas_${kelasUpper.replace(/\s+/g, '_')}_${selectedMonth}_${tahunPelajaran.replace(/\//g, '-')}.xlsx`);

    showToast(`Daftar Hadir Siswa bulan ${selectedMonth} berhasil diunduh.`);
  };

  // Trigger Print (tambahkan kelas body print-absensi agar tab tampil di kertas)
  const handlePrint = () => {
    triggerPrint('absensi');
  };

  // Trigger cetak semua kartu barcode siswa
  const printAllBarcodes = () => {
    document.body.classList.add('print-barcode');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('print-barcode');
    }, 500);
  };

  return (
    <div id="tab-absensi" className="tab-content space-y-6">
      {/* HEADER BAR & CONTROLS */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4 no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl shadow-xs">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                Daftar Hadir Siswa (Presensi)
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Tersinkron Buku Nilai
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Nama siswa terhubung secara otomatis dengan menu Buku Nilai. Tentukan tanggal & kehadiran siswa di bawah ini.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={markAllHadirMonth}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs"
              title="Isi otomatis Hadir (H) untuk seluruh hari aktif bulan ini"
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Set Semua Hadir (H)</span>
            </button>

            <button
              onClick={() => setShowBarcodeModal(true)}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs"
              title="Unduh & bagikan kartu QR code absen per siswa"
            >
              <QrCode className="w-4 h-4 text-indigo-700" />
              <span>Kartu QR Code</span>
            </button>

            <button
              onClick={() => setShowScanModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
              title="Scan kartu QR code siswa untuk mengisi kehadiran otomatis"
            >
              <Camera className="w-4 h-4 text-amber-200" />
              <span>Scan QR Code</span>
            </button>

            <button
              onClick={exportToExcel}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Format Excel</span>
            </button>

            <button
              onClick={handlePrint}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border border-slate-200"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Cetak / Print</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Bulan
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {MONTHS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Tahun Pelajaran
            </label>
            <input
              type="text"
              value={tahunPelajaran}
              onChange={(e) => setTahunPelajaran(e.target.value)}
              placeholder="2025/2026"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Kelas (dari Biodata)
            </label>
            <input
              type="text"
              readOnly
              value={selectedClass}
              title="Kelas mengikuti pengaturan di menu Biodata Sekolah"
              className="w-full bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-1.5 text-xs font-bold text-indigo-900 cursor-not-allowed"
            />
            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Otomatis dari Biodata Sekolah
            </p>
          </div>

          <div className="flex items-end">
            <button
              onClick={resetMonthAttendance}
              className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Presensi Bulan Ini</span>
            </button>
          </div>
        </div>

        {/* Info Legend */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-slate-700">Keterangan:</span>
            <span className="inline-flex items-center space-x-1">
              <span className="w-5 h-5 rounded bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold flex items-center justify-center text-[10px]">H</span>
              <span>= Hadir</span>
            </span>
            <span className="inline-flex items-center space-x-1">
              <span className="w-5 h-5 rounded bg-blue-100 border border-blue-300 text-blue-800 font-bold flex items-center justify-center text-[10px]">S</span>
              <span>= Sakit</span>
            </span>
            <span className="inline-flex items-center space-x-1">
              <span className="w-5 h-5 rounded bg-amber-100 border border-amber-300 text-amber-800 font-bold flex items-center justify-center text-[10px]">I</span>
              <span>= Izin</span>
            </span>
            <span className="inline-flex items-center space-x-1">
              <span className="w-5 h-5 rounded bg-rose-100 border border-rose-300 text-rose-800 font-bold flex items-center justify-center text-[10px]">A</span>
              <span>= Alpa</span>
            </span>
            <span className="inline-flex items-center space-x-1">
              <span className="w-5 h-5 rounded bg-rose-500 border border-rose-600 text-white font-bold flex items-center justify-center text-[10px]">L</span>
              <span className="font-semibold text-rose-700">= Libur (Sabtu &amp; Minggu)</span>
            </span>
            <span className="text-slate-400 text-[11px] font-medium hidden sm:inline">(Klik sel untuk berganti status)</span>
          </div>

          <div className="text-xs font-bold text-indigo-900 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100 flex items-center space-x-2">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Total Siswa: {students.length} orang</span>
          </div>
        </div>
      </div>

      {/* CLASS SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 no-print">
        <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 font-extrabold flex items-center justify-center text-sm border border-emerald-200">
            H
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Total Hadir</p>
            <p className="text-base font-extrabold text-emerald-800">{classSummary.totalH}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-blue-100 shadow-2xs flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 font-extrabold flex items-center justify-center text-sm border border-blue-200">
            S
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Total Sakit</p>
            <p className="text-base font-extrabold text-blue-800">{classSummary.totalS}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-amber-100 shadow-2xs flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 font-extrabold flex items-center justify-center text-sm border border-amber-200">
            I
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Total Izin</p>
            <p className="text-base font-extrabold text-amber-800">{classSummary.totalI}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-rose-100 shadow-2xs flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-700 font-extrabold flex items-center justify-center text-sm border border-rose-200">
            A
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Total Alpa</p>
            <p className="text-base font-extrabold text-rose-800">{classSummary.totalA}</p>
          </div>
        </div>
      </div>

      {/* PRINTABLE HEADER CONTAINER (Visible during print) */}
      <div className="hidden print:block text-center space-y-1 mb-4 font-serif">
        {biodata.logo && <img src={biodata.logo} className="print-kop-logo max-h-16 object-contain mx-auto mb-2" alt="Logo Sekolah" />}
        <h2 className="text-2xl font-black uppercase tracking-wide text-black">
          {biodata.namaSekolah || "NAMA SEKOLAH"}
        </h2>
        <p className="text-sm font-semibold uppercase text-black">
          {biodata.alamat || "Alamat Sekolah"} {biodata.kota || ""}
        </p>
        <h3 className="text-lg font-bold uppercase tracking-wider text-black pt-2">
          DAFTAR HADIR SISWA
        </h3>
        <p className="text-sm font-bold uppercase text-black">
          TAHUN PELAJARAN {tahunPelajaran}
        </p>
        <p className="text-sm font-bold uppercase text-black">
          BULAN : {selectedMonth.toUpperCase()}
        </p>
        <p className="text-sm font-bold uppercase text-black pt-2">
          KELAS : {selectedClass.toUpperCase()}
        </p>
      </div>

      {/* ATTENDANCE MATRIX TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-center border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold">
                <th rowSpan={2} className="py-2.5 px-2 border-r border-slate-300 w-10 sticky left-0 bg-slate-100 z-10">
                  No
                </th>
                <th rowSpan={2} className="py-2.5 px-3 border-r border-slate-300 text-left min-w-[180px] sm:min-w-[220px] sticky left-10 bg-slate-100 z-10">
                  Nama Siswa
                </th>
                <th colSpan={31} className="py-1.5 px-1 border-r border-slate-300 text-center uppercase tracking-wider">
                  Tanggal
                </th>
                <th colSpan={3} className="py-1.5 px-2 text-center uppercase tracking-wider">
                  Jumlah
                </th>
              </tr>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-300 font-bold">
                {daysArray.map((d) => {
                  const dayInfo = getDayOfWeek(d, selectedMonth, tahunPelajaran);
                  const isOut = d > activeDays;
                  return (
                    <th
                      key={d}
                      className={`py-1 px-0.5 border-r border-slate-300 w-7 sm:w-8 text-[10px] leading-tight select-none ${
                        isOut
                          ? 'bg-slate-100 text-slate-400 font-normal'
                          : dayInfo.isWeekend
                          ? 'bg-rose-500 text-white font-extrabold border-r border-rose-600'
                          : 'bg-slate-50 text-slate-700 font-bold'
                      }`}
                      title={
                        isOut
                          ? `Bulan ${selectedMonth} hanya sampai tanggal ${activeDays}`
                          : `${dayInfo.dayFull}, ${d} ${selectedMonth} ${dayInfo.year}`
                      }
                    >
                      <div>{d}</div>
                      {!isOut && <div className="text-[9px] opacity-90">{dayInfo.dayShort}</div>}
                    </th>
                  );
                })}
                <th className="py-1.5 px-1 border-r border-slate-300 w-8 text-blue-800 bg-blue-50/50">S</th>
                <th className="py-1.5 px-1 border-r border-slate-300 w-8 text-amber-800 bg-amber-50/50">I</th>
                <th className="py-1.5 px-1 w-8 text-rose-800 bg-rose-50/50">A</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={36} className="py-8 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Users className="w-8 h-8 text-slate-300" />
                      <p className="text-sm font-semibold">Belum ada data siswa di Buku Nilai.</p>
                      <p className="text-xs text-slate-500">
                        Tambahkan nama siswa pada menu <strong>Buku Nilai</strong> agar otomatis muncul di sini.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                students.map((st, index) => {
                  const stats = getStudentStats(st.id);
                  return (
                    <tr
                      key={st.id}
                      className="hover:bg-indigo-50/30 transition-colors"
                    >
                      <td className="py-2 px-2 border-r border-slate-200 font-semibold text-slate-600 bg-white sticky left-0 z-10">
                        {index + 1}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-left font-bold text-slate-800 bg-white sticky left-10 z-10 truncate max-w-[220px]">
                        {st.nama}
                      </td>

                      {/* Day cells 1..31 */}
                      {daysArray.map((d) => {
                        const dayInfo = getDayOfWeek(d, selectedMonth, tahunPelajaran);
                        const isOut = d > activeDays;
                        const isOff = isOut || dayInfo.isWeekend;
                        const key = `${selectedMonth}_${st.id}_${d}`;
                        const val = attendanceData[key] || '';

                        let badgeBg = 'hover:bg-slate-100 text-slate-400';
                        if (val === 'H') badgeBg = 'bg-emerald-100 text-emerald-800 font-extrabold border-emerald-300';
                        else if (val === 'S') badgeBg = 'bg-blue-100 text-blue-800 font-extrabold border-blue-300';
                        else if (val === 'I') badgeBg = 'bg-amber-100 text-amber-800 font-extrabold border-amber-300';
                        else if (val === 'A') badgeBg = 'bg-rose-100 text-rose-800 font-extrabold border-rose-300';

                        return (
                          <td
                            key={d}
                            onClick={() => !isOff && toggleAttendance(st.id, d)}
                            className={`p-0.5 border-r text-center select-none ${
                              isOut
                                ? 'bg-slate-100/60 border-slate-200 cursor-not-allowed'
                                : dayInfo.isWeekend
                                ? 'bg-rose-100/70 border-rose-200 cursor-not-allowed'
                                : 'border-slate-200 cursor-pointer'
                            }`}
                            title={
                              isOut
                                ? `Bulan ${selectedMonth} hanya sampai tanggal ${activeDays}`
                                : dayInfo.isWeekend
                                ? `Libur (${dayInfo.dayFull}, ${d} ${selectedMonth})`
                                : `${st.nama} - Tgl ${d} ${selectedMonth}: ${val || 'Belum diisi'}`
                            }
                          >
                            <div
                              className={`w-6 h-6 sm:w-7 sm:h-7 mx-auto rounded flex items-center justify-center text-xs transition border ${
                                dayInfo.isWeekend
                                  ? 'bg-rose-200/80 border-rose-300 text-rose-800 font-bold'
                                  : badgeBg
                              }`}
                            >
                              {dayInfo.isWeekend ? 'L' : val}
                            </div>
                          </td>
                        );
                      })}

                      {/* Summary S, I, A */}
                      <td className="py-2 px-1 border-r border-slate-200 font-bold text-blue-800 bg-blue-50/20">
                        {stats.s > 0 ? stats.s : ''}
                      </td>
                      <td className="py-2 px-1 border-r border-slate-200 font-bold text-amber-800 bg-amber-50/20">
                        {stats.i > 0 ? stats.i : ''}
                      </td>
                      <td className="py-2 px-1 font-bold text-rose-800 bg-rose-50/20">
                        {stats.a > 0 ? stats.a : ''}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINT SIGNATURE FOOTER */}
      <div className="hidden print:block pt-10 text-xs font-serif">
        <div className="flex justify-between items-start px-8">
          <div className="text-center space-y-16">
            <p>Mengetahui,<br />Kepala Sekolah</p>
            <div>
              <p className="font-bold underline">{biodata.namaKepsek || "........................................."}</p>
              <p>NIP. {biodata.nipKepsek || "........................................."}</p>
            </div>
          </div>

          <div className="text-center space-y-16">
            <p>{biodata.kota || "Batu Bahalang"}, .................... 2026<br />Guru Kelas</p>
            <div>
              <p className="font-bold underline">{biodata.namaGuru || "........................................."}</p>
              <p>NIP. {biodata.nipGuru || "........................................."}</p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: DAFTAR KARTU QR CODE SISWA */}
      <BarcodeListModal
        open={showBarcodeModal}
        students={students as BarcodeStudent[]}
        biodata={biodata}
        kelas={selectedClass}
        onClose={() => setShowBarcodeModal(false)}
        showToast={showToast}
        onPrintAll={printAllBarcodes}
      />

      {/* LEMBAR CETAK SEMUA KARTU QR CODE (print-barcode) */}
      <div id="barcode-print-sheet" className="hidden">
        <div className="barcode-print-header text-center pb-3">
          {biodata.logo && <img src={biodata.logo} className="print-kop-logo max-h-14 object-contain mx-auto mb-1" alt="Logo Sekolah" />}
          <h2 className="text-xl font-black uppercase text-black">
            {biodata.namaSekolah || "NAMA SEKOLAH"}
          </h2>
          <p className="text-xs font-semibold uppercase text-black">
            KARTU QR CODE ABSEN SISWA | KELAS : {selectedClass.toUpperCase()} | TAHUN PELAJARAN {tahunPelajaran}
          </p>
        </div>
        <div className="barcode-print-grid">
          {students.map((st) => (
            <div key={st.id} className="barcode-print-card">
              <p className="font-black text-[11px] text-black uppercase">{st.nama}</p>
              <p className="text-[9px] text-black">
                NISN: {st.nisn || '-'} | Kelas: {selectedClass || '-'}
              </p>
              <div className="flex justify-center py-1">
                <StudentBarcode code={barcodeCodeOf(st)} height={40} />
              </div>
              <p className="text-center font-mono text-[8px] text-black">{barcodeCodeOf(st)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: SCAN KARTU QR CODE (isi kehadiran otomatis) */}
      <BarcodeScanModal
        open={showScanModal}
        students={students as BarcodeStudent[]}
        onClose={() => setShowScanModal(false)}
        onScan={handleBarcodeScanned}
        showToast={showToast}
        isDemo={isDemo}
      />
    </div>
  );
};
