import React, { useState, useRef } from 'react';
import { Camera, Zap, Activity, X, ScanSearch, UploadCloud, Droplet, Leaf, Flame, Beaker, Loader2, Image as ImageIcon } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { analyzeNutritionText } from './services/ai';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [notification, setNotification] = useState(null);

  const [dailyRemaining, setDailyRemaining] = useState({
    kalori: 2000,
    karbohidrat: 300,
    protein: 70,
    lemak: 65,
    gula: 50,
    natrium: 2000
  });

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const handleCameraClick = () => cameraInputRef.current.click();
  const handleGalleryClick = () => galleryInputRef.current.click();

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000); // Notifikasi hilang otomatis setelah 3 detik
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setStatusMessage('');
    }
  };

  const handleCancelScan = () => {
    setSelectedImage(null);
    setStatusMessage('');
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    setStatusMessage('Membaca teks dari gambar');

    try {
      const tesseractResult = await Tesseract.recognize(selectedImage, 'eng+ind');
      const rawText = tesseractResult.data.text;

      setStatusMessage('Sedang menganalisis gizi');

      const scannedNutrition = await analyzeNutritionText(rawText);

      setDailyRemaining((prev) => ({
        kalori: Math.max(0, prev.kalori - scannedNutrition.kalori),
        karbohidrat: Math.max(0, prev.karbohidrat - scannedNutrition.karbohidrat),
        protein: Math.max(0, prev.protein - scannedNutrition.protein),
        lemak: Math.max(0, prev.lemak - scannedNutrition.lemak),
        gula: Math.max(0, prev.gula - scannedNutrition.gula),
        natrium: Math.max(0, prev.natrium - scannedNutrition.natrium)
      }));

      setTimeout(() => {
        showNotification(`Berhasil dianalisis! Anggaran nutrisi harian telah dikurangi`);
        handleCancelScan();
        setStatusMessage('');
      }, 500);

    } catch (error) {
      console.error(error);
      showNotification("Gagal menganalisis. Coba foto yang lebih jelas.", "error");
      setStatusMessage('');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex justify-center bg-gradient-to-br from-emerald-50 via-slate-50 to-rose-50 p-0 md:p-6 lg:p-10">
      <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-emerald-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-96 h-96 bg-rose-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none"></div>

      <main className="w-full max-w-6xl flex flex-col md:flex-row gap-6 lg:gap-10 relative z-10">

        <section className={`w-full md:w-1/2 lg:w-[45%] flex-col min-h-screen md:min-h-0 bg-white/40 md:bg-white/60 backdrop-blur-md md:rounded-[2.5rem] md:border border-white/50 shadow-none md:shadow-2xl md:shadow-slate-200/50 relative overflow-hidden ${selectedImage ? 'hidden md:flex' : 'flex'}`}>
          <header className="p-6 md:p-8 pt-10 md:pt-8 z-10 sticky top-0 bg-white/40 md:bg-transparent backdrop-blur-md md:backdrop-blur-none border-b border-white/20 md:border-none">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500">
                  Halo, Pengguna!
                </h1>
                <p className="text-sm md:text-base text-slate-500 mt-1 font-medium tracking-wide">Pantau asupan gizi harianmu</p>
              </div>
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30 border-2 border-white"></div>
            </div>
          </header>

          <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8 pb-32 md:pb-8">
            <div className="relative w-full h-56 md:h-64 bg-white/60 backdrop-blur-lg rounded-[2rem] border border-white/50 shadow-xl shadow-slate-200/50 flex flex-col items-center justify-center overflow-hidden">
              <div className="w-40 h-40 md:w-44 md:h-44 rounded-full border-4 border-slate-100 relative flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-[5px] border-emerald-400 border-t-transparent -rotate-45"></div>
                <div className="text-center">
                  <span className="block text-4xl md:text-5xl font-black text-slate-800">{dailyRemaining.kalori}</span>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Kkal Sisa</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">Makronutrisi</h3>
              <div className="grid grid-cols-3 gap-3 md:gap-4">
                <div className="p-4 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-md shadow-slate-200/30 flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 mb-2"><Leaf size={18} /></div>
                  <span className="block text-xl font-bold text-slate-800">{dailyRemaining.karbohidrat}g</span>
                  <span className="text-xs font-medium text-slate-500">Sisa Karbo</span>
                </div>
                <div className="p-4 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-md shadow-slate-200/30 flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mb-2"><Activity size={18} /></div>
                  <span className="block text-xl font-bold text-slate-800">{dailyRemaining.protein}g</span>
                  <span className="text-xs font-medium text-slate-500">Sisa Protein</span>
                </div>
                <div className="p-4 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-md shadow-slate-200/30 flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 mb-2"><Droplet size={18} /></div>
                  <span className="block text-xl font-bold text-slate-800">{dailyRemaining.lemak}g</span>
                  <span className="text-xs font-medium text-slate-500">Sisa Lemak</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider mb-4 px-1 flex items-center gap-2"><Flame size={16} /> Batas Waspada</h3>
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="p-5 md:p-6 bg-gradient-to-br from-rose-50/80 to-white/40 backdrop-blur-md rounded-3xl border border-rose-100 shadow-lg shadow-rose-200/20 flex flex-col justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-500 mb-4"><Zap size={24} /></div>
                  <div>
                    <span className="block text-3xl font-bold text-slate-800">{dailyRemaining.gula}g</span>
                    <span className="text-sm font-semibold text-rose-500">Sisa Gula</span>
                  </div>
                </div>
                <div className="p-5 md:p-6 bg-gradient-to-br from-indigo-50/80 to-white/40 backdrop-blur-md rounded-3xl border border-indigo-100 shadow-lg shadow-indigo-200/20 flex flex-col justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-500 mb-4"><Beaker size={24} /></div>
                  <div>
                    <span className="block text-3xl font-bold text-slate-800">{dailyRemaining.natrium}mg</span>
                    <span className="text-sm font-semibold text-indigo-500">Sisa Natrium</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="md:hidden fixed bottom-8 w-full flex justify-center z-50 px-6 pointer-events-none gap-2">
            <button onClick={handleGalleryClick} className="pointer-events-auto bg-slate-200 text-slate-700 p-4 rounded-2xl shadow-lg flex items-center justify-center active:scale-95 transition-all">
              <ImageIcon size={24} />
            </button>
            <button onClick={handleCameraClick} className="pointer-events-auto bg-slate-800 text-white flex-1 py-4 rounded-2xl shadow-2xl shadow-slate-800/20 flex items-center justify-center gap-3 font-semibold active:scale-95 transition-all">
              <Camera size={24} />
              <span>Pindai Komposisi</span>
            </button>
          </div>
        </section>

        <section className={`w-full md:w-1/2 lg:w-[55%] flex-col md:bg-white/60 md:backdrop-blur-md md:rounded-[2.5rem] md:border border-white/50 shadow-none md:shadow-2xl md:shadow-slate-200/50 overflow-hidden ${selectedImage ? 'absolute md:relative inset-0 z-50 bg-slate-900 md:bg-transparent flex' : 'hidden md:flex p-8'}`}>

          <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleImageChange} className="hidden" />
          <input type="file" accept="image/*" ref={galleryInputRef} onChange={handleImageChange} className="hidden" />

          {!selectedImage ? (
            <div className="w-full h-full border-4 border-dashed border-slate-300/60 rounded-[2rem] flex flex-col items-center justify-center bg-white/30 hover:bg-white/50 transition-colors cursor-pointer group" onClick={handleCameraClick}>
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:scale-110 transition-all duration-300 mb-6 shadow-sm"><UploadCloud size={48} /></div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">Unggah atau Pindai</h3>
              <p className="text-slate-500 font-medium text-center px-8">Klik di sini untuk mengambil foto informasi nilai gizi dari kemasan produk</p>
            </div>
          ) : (
            <div className="flex flex-col h-full w-full">
              <header className="p-6 md:p-8 flex justify-between items-center text-white md:text-slate-800 shrink-0">
                <h2 className="font-semibold tracking-wide text-lg">Pratinjau Label</h2>
                <button onClick={handleCancelScan} className="p-2 bg-white/20 md:bg-slate-200 rounded-full hover:bg-white/30 md:hover:bg-slate-300 transition-colors" disabled={isAnalyzing}>
                  <X size={20} className="md:text-slate-700" />
                </button>
              </header>

              <div className="flex-1 p-4 flex flex-col items-center justify-center overflow-hidden">
                <div className={`relative w-full max-w-md md:max-w-full h-full max-h-[50vh] rounded-2xl overflow-hidden border md:border-2 border-white/10 md:border-emerald-100 bg-black/40 md:bg-slate-100/50 flex items-center justify-center shadow-2xl transition-all ${isAnalyzing ? 'ring-4 ring-emerald-500 ring-opacity-50' : ''}`}>
                  <img src={selectedImage} alt="Hasil Scan" className="w-full h-full object-contain" />
                  {isAnalyzing && <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400 shadow-[0_0_20px_#34d399] animate-[bounce_2s_infinite]"></div>}
                </div>

                {/* Status bar baru yang bersih */}
                {statusMessage && (
                  <div className="w-full max-w-md md:max-w-full mt-4 p-3 bg-white/20 backdrop-blur-md rounded-xl border border-white/20 text-center">
                    <span className="text-sm font-medium text-white flex items-center justify-center gap-2">
                      {isAnalyzing && <Loader2 size={16} className="animate-spin" />}
                      {statusMessage}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6 md:p-8 pb-10 md:pb-8 shrink-0">
                <button onClick={handleAnalyze} disabled={isAnalyzing} className={`text-white w-full py-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 font-semibold transition-all text-lg ${isAnalyzing ? 'bg-emerald-400 cursor-not-allowed shadow-emerald-500/10' : 'bg-emerald-500 hover:bg-emerald-400 active:scale-95 shadow-emerald-500/30'}`}>
                  {isAnalyzing ? <><Loader2 size={28} className="animate-spin" /><span>Memproses Data</span></> : <><ScanSearch size={28} /><span>Analisis Nutrisi Sekarang</span></>}
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {notification && (
        <div className={`fixed top-6 right-6 z-[100] px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/30 flex items-center gap-3 animate-fade-in ${notification.type === 'error' ? 'bg-rose-500/90 text-white' : 'bg-emerald-500/90 text-white'}`}>
          <span className="font-semibold">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-2 hover:bg-white/20 rounded-full p-1">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default App;