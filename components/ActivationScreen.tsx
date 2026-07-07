import React, { useState, useEffect } from 'react';
import { 
  Bot, Key, Mail, Lock, Sparkles, Copy, Check, 
  ExternalLink, Eye, EyeOff, ShieldCheck, HelpCircle,
  Trash2, UserPlus, CheckCircle2, AlertTriangle, ToggleLeft, ToggleRight, Users, ChevronLeft, X,
  MessageCircle, Save
} from 'lucide-react';
import { Button } from './UI';
import { 
  generateLicenseKey, 
  validateLicense, 
  saveCredentials, 
  getSavedCredentials,
  getRegisteredUsers, 
  saveRegisteredUsers,
  registerUser, 
  deleteUser, 
  validateUserActivation,
  RegisteredUser,
  getRegisteredUsersFromDb,
  registerUserOnDb,
  deleteUserFromDb,
  checkUserOnDb,
  validateUserActivationFromDb,
  updateUserGeminiKeyOnDb
} from '../services/licenseService';
import { getAdminPassword, updateAdminPassword } from '../services/adminService';
import { testApiKey } from '../services/geminiService';

interface ActivationScreenProps {
  onActivated: () => void;
}

export const ActivationScreen: React.FC<ActivationScreenProps> = ({ onActivated }) => {
  // Page toggle state: 'user' (default clean page) or 'admin' (separate page)
  const [viewMode, setViewMode] = useState<'user' | 'admin'>('user');
  const [dbAdminPassword, setDbAdminPassword] = useState('admin123');

  // Activation form states - initially blank placeholders as requested
  const [email, setEmail] = useState('');
  const [userGeminiKey, setUserGeminiKey] = useState('');
  const [detectedApiKey, setDetectedApiKey] = useState('');
  const [isAccountVerified, setIsAccountVerified] = useState(false);
  const [isEmailRegistered, setIsEmailRegistered] = useState(false);
  const [userStatus, setUserStatus] = useState<'not_found' | 'pending' | 'active' | ''>('');
  const [showRegistrationPopup, setShowRegistrationPopup] = useState(false);
  const [activationError, setActivationError] = useState<string | null>(null);
  const [isTestingActivationKey, setIsTestingActivationKey] = useState(false);
  const [activationKeyTestResult, setActivationKeyTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Admin Authorization & Database States
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState<string | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Add User Form States
  const [newEmail, setNewEmail] = useState('');
  const [newGeminiKey, setNewGeminiKey] = useState('');
  const [newIsActive, setNewIsActive] = useState(true);
  const [showDevModal, setShowDevModal] = useState(false);

  // Copy states
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Load registered users and admin password on mount
  useEffect(() => {
    if (viewMode === 'admin') {
      getRegisteredUsersFromDb().then(setRegisteredUsers).catch(console.error);
    } else {
      const list = getRegisteredUsers();
      setRegisteredUsers(list);
    }
    
    getAdminPassword().then(setDbAdminPassword);
  }, [viewMode]);

  // Detect registered user
  useEffect(() => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setUserStatus('');
      setIsAccountVerified(false);
      setIsEmailRegistered(false);
      setDetectedApiKey('');
      return;
    }

    // Only query Firestore if the input resembles a complete email (contains @ and .)
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setUserStatus('');
      setIsAccountVerified(false);
      setIsEmailRegistered(false);
      setDetectedApiKey('');
      return;
    }

    let active = true;
    checkUserOnDb(cleanEmail).then((verified) => {
      if (!active) return;
      if (verified) {
        setIsEmailRegistered(true);
        if (verified.isActive) {
          setUserStatus('active');
          setIsAccountVerified(true);
          setDetectedApiKey(verified.geminiApiKey);
          setActivationError(null);

          // AUTO-LOGIN IF GEMINI API KEY IS ALREADY SAVED ON DATABASE
          if (verified.geminiApiKey && verified.geminiApiKey.trim().length > 0) {
            // Save registered user to the local cache so validation checks pass
            const cached = getRegisteredUsers();
            const existingIndex = cached.findIndex(u => u.email === cleanEmail);
            if (existingIndex >= 0) {
              cached[existingIndex] = verified;
            } else {
              cached.push(verified);
            }
            saveRegisteredUsers(cached);

            // Save credentials to local storage
            saveCredentials(cleanEmail, verified.licenseKey, verified.geminiApiKey);

            // Trigger onActivated
            setSuccessToast(`Aktivasi Otomatis Berhasil! Selamat datang, ${verified.email}`);
            setTimeout(() => {
              if (active) {
                onActivated();
              }
            }, 1200);
          }
        } else {
          setUserStatus('pending');
          setIsAccountVerified(false);
          setDetectedApiKey('');
        }
      } else {
        setUserStatus('not_found');
        setIsEmailRegistered(false);
        setIsAccountVerified(false);
        setDetectedApiKey('');
      }
    }).catch((err) => {
      console.error("Gagal memverifikasi akun dari DB:", err);
    });

    return () => {
      active = false;
    };
  }, [email]);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActivationError(null);

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setActivationError("Email Pengguna wajib diisi.");
      return;
    }

    // Verify against the registered users system
    const verifiedUser = await checkUserOnDb(cleanEmail);
    if (!verifiedUser || !verifiedUser.isActive) {
      setActivationError("Akun tidak ditemukan atau belum aktif. Silakan hubungi Admin.");
      return;
    }

    // Save credentials (using centralized server key)
    saveCredentials(cleanEmail, "NO_TOKEN", verifiedUser.geminiApiKey || "CENTRALIZED_SERVER_KEY");
    
    setSuccessToast(`Aktivasi Berhasil! Selamat datang, ${verifiedUser.email}`);
    setTimeout(() => {
      onActivated();
    }, 1500);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setActivationError(null);
    const cleanEmail = email.trim();
    const cleanApiKey = userGeminiKey.trim();

    if (!cleanEmail) {
      setActivationError("Email Pengguna wajib diisi.");
      return;
    }

    if (!cleanApiKey) {
      setActivationError("API Key Gemini wajib diisi saat pendaftaran agar tersimpan di database.");
      return;
    }
    
    try {
      await registerUserOnDb(cleanEmail, cleanApiKey, false);
      setShowRegistrationPopup(true);
    } catch (err) {
      console.error(err);
      setActivationError("Gagal melakukan registrasi.");
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    const pass = adminPassword.trim();
    
    // Check against DB password
    if (pass === dbAdminPassword) {
      setIsAdmin(true);
      setAdminPassword('');
      setSuccessToast("Akses Admin Terbuka!");
      setTimeout(() => setSuccessToast(null), 2000);
    } else {
      setAdminError("Password Admin salah. Silakan coba lagi.");
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newEmail.trim();

    if (!cleanEmail) {
      alert("Harap lengkapi email.");
      return;
    }

    // Use specified key or automatically generate/fetch from environment
    const activeCreds = getSavedCredentials();
    const systemKey = newGeminiKey.trim() || (typeof process !== "undefined" ? (process.env.GEMINI_API_KEY || process.env.API_KEY) : null) || (activeCreds ? activeCreds.geminiApiKey : '') || localStorage.getItem("user_gemini_api_key") || "AIzaSyDUMMY_AUTO_GENERATED_KEY_12345";

    await registerUserOnDb(cleanEmail, systemKey, newIsActive);
    
    // Refresh list
    const updated = await getRegisteredUsersFromDb();
    setRegisteredUsers(updated);
    
    // Reset add form
    setNewEmail('');
    setNewGeminiKey('');
    setNewIsActive(true);
    
    setSuccessToast("User baru berhasil terdaftar!");
    setTimeout(() => setSuccessToast(null), 2500);
  };

  const handleDeleteUser = async (emailToDelete: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus user ${emailToDelete}?`)) {
      await deleteUserFromDb(emailToDelete);
      const updated = await getRegisteredUsersFromDb();
      setRegisteredUsers(updated);
      setSuccessToast("User berhasil dihapus.");
      setTimeout(() => setSuccessToast(null), 2000);
    }
  };

  const handleToggleUserStatus = async (user: RegisteredUser) => {
    await registerUserOnDb(user.email, user.geminiApiKey, !user.isActive);
    const updated = await getRegisteredUsersFromDb();
    setRegisteredUsers(updated);
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(text);
    setSuccessToast(`${label} berhasil disalin!`);
    setTimeout(() => {
      setCopiedToken(null);
      setSuccessToast(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 via-white to-orange-50 text-slate-850 flex flex-col items-center justify-center p-4 md:p-8 font-sans relative overflow-hidden">
      {/* Decorative ambient blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-300/15 blur-[120px] pointer-events-none" />

      {/* Header (Adapts based on screen) */}
      <div className="text-center mb-8 max-w-lg z-10 animate-fade-in">
        <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-2xl mb-4 border border-blue-100 shadow-md shadow-blue-900/5 animate-pulse">
          <Bot size={40} className="text-blue-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
          RPM Generator <span className="text-orange-600 font-black">Pro</span>
        </h1>
        <p className="text-slate-600 text-sm md:text-base font-medium">
          {viewMode === 'admin' 
            ? "Portal Administrator - Kelola Lisensi Pengguna" 
            : "Rencana Pembelajaran Mendalam berbasis Kurikulum Nasional dengan AI."
          }
        </p>
      </div>

      {/* Main Container */}
      <div className="max-w-2xl w-full z-10 animate-fade-in-up">
        
        {viewMode === 'user' ? (
          /* ==================== CLEAN USER ACTIVATION PAGE ==================== */
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-blue-100/80 p-6 md:p-8 shadow-xl shadow-blue-900/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-sans">Aktivasi Aplikasi</h2>
                <p className="text-xs text-slate-500">Masukkan email terdaftar Anda.</p>
              </div>
            </div>

            {activationError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm flex items-start gap-3">
                <span className="font-bold shrink-0 text-red-600">⚠</span>
                <p className="text-xs font-medium">{activationError}</p>
              </div>
            )}

            {userStatus === 'active' ? (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs flex flex-col gap-1.5 shadow-sm animate-fade-in">
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 size={16} />
                  <span className="font-bold">Email valid dan aktif!</span>
                </div>
                <p className="text-slate-600 font-medium">
                  Email Anda berhasil terverifikasi. Silakan klik tombol di bawah untuk mengaktifkan dan membuka aplikasi.
                </p>
              </div>
            ) : userStatus === 'pending' ? (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start gap-2.5 animate-fade-in">
                <AlertTriangle size={16} className="shrink-0 text-amber-600 mt-0.5" />
                <div className="leading-relaxed">
                  <p className="font-semibold text-amber-600">Email yang sudah masuk sistem menunggu diaktifkan oleh admin.</p>
                  <p className="text-slate-600 mt-1 text-[11px] font-mono font-medium">WhatsApp: 085604431706</p>
                </div>
              </div>
            ) : null}

            <form onSubmit={userStatus === 'not_found' ? handleRegister : handleActivate} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-2">
                  <Mail size={14} className="text-slate-500" /> Email Pengguna
                </label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan Email Pengguna"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-sm shadow-sm"
                  required
                />
              </div>

              {userStatus === 'not_found' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-2">
                    <Key size={14} className="text-slate-500" /> API Key Gemini Pengguna <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="password"
                    value={userGeminiKey}
                    onChange={(e) => setUserGeminiKey(e.target.value)}
                    placeholder="Masukkan API Key Gemini Anda (AIzaSy...)"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-sm shadow-sm font-mono"
                    required
                  />
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Wajib diisi dan disimpan ke database agar Anda dapat menggunakan AI dengan API key milik Anda sendiri. Belum punya API Key? Dapatkan secara gratis di <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium hover:text-blue-700">Google AI Studio</a>.
                  </p>
                </div>
              )}



              <button
                type="submit"
                className={`w-full mt-6 bg-gradient-to-r ${(userStatus === 'active' || userStatus === 'not_found') ? 'from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 border-blue-800' : 'from-slate-100 to-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'} border-b-4 active:border-b-0 active:translate-y-1 transition-all rounded-xl py-3.5 font-bold ${(userStatus === 'active' || userStatus === 'not_found') ? 'text-white shadow-lg shadow-blue-500/10' : 'text-slate-400'} flex items-center justify-center gap-2`}
                disabled={userStatus === 'pending' || email.trim() === ''}
              >
                {userStatus === 'not_found' ? (
                  <>
                    <UserPlus size={18} /> Registrasi Email
                  </>
                ) : (
                  <>
                    <Key size={18} /> Aktifkan & Buka Aplikasi
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* ==================== SEPARATE ADMIN PANEL VIEW ==================== */
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-blue-100/80 p-6 md:p-8 shadow-xl shadow-blue-900/5">
            <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-4">
              <button
                onClick={() => setViewMode('user')}
                className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors py-1 px-2.5 rounded-lg bg-slate-100 border border-slate-200"
              >
                <ChevronLeft size={14} /> Kembali ke Aktivasi
              </button>

              {isAdmin && (
                <button
                  onClick={handleAdminLogout}
                  className="text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition-all font-semibold animate-fade-in"
                >
                  Keluar Admin
                </button>
              )}
            </div>

            {!isAdmin ? (
              <div className="space-y-5 animate-fade-in py-4">
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl text-center">
                  <div className="mx-auto w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-3">
                    <Lock size={24} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 font-sans">Akses Manajemen Terkunci</h3>
                </div>

                {adminError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs text-center font-medium">
                    {adminError}
                  </div>
                )}

                <form onSubmit={handleAdminLogin} className="space-y-4 max-w-sm mx-auto">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-2">
                      <Lock size={12} /> Password Administrator
                    </label>
                    <input 
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Masukkan Password Administrator"
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all text-sm font-mono text-center shadow-sm"
                      required
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border-b-4 border-indigo-900 active:border-b-0 active:translate-y-1 transition-all rounded-xl py-2.5 font-bold text-white shadow-md text-xs flex items-center justify-center gap-1.5"
                  >
                    Masuk Panel Admin
                  </button>
                </form>
              </div>
            ) : (
              <div className="animate-fade-in space-y-6">
                
                {/* Password Management */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Lock size={14} /> Keamanan Admin
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                        <Key size={12} /> Ubah Password Admin
                      </label>
                      <div className="flex gap-2">
                        <div className="relative w-full">
                          <input 
                            type={showPassword ? 'text' : 'password'}
                            value={newAdminPassword}
                            onChange={(e) => setNewAdminPassword(e.target.value)}
                            placeholder="Masukkan password baru"
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-all text-xs shadow-sm pr-9"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                        <button
                          onClick={async () => {
                            if (!newAdminPassword.trim()) return;
                            await updateAdminPassword(newAdminPassword.trim());
                            setDbAdminPassword(newAdminPassword.trim());
                            setNewAdminPassword('');
                            setSuccessToast("Password Admin berhasil diperbarui!");
                            setTimeout(() => setSuccessToast(null), 2500);
                          }}
                          className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-3 py-2 rounded-lg text-xs transition-colors"
                        >
                          <Save size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add User Section */}
                <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 shadow-sm">
                  <h3 className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <UserPlus size={14} /> Daftarkan Pengguna Baru
                  </h3>
                  
                  <form onSubmit={handleAddUser} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                        <Mail size={12} /> Email Guru / Pengguna
                      </label>
                      <input 
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="Masukkan Email Guru / Pengguna"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-all text-xs shadow-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                        <Key size={12} /> API Key Gemini (Opsional)
                      </label>
                      <input 
                        type="password"
                        value={newGeminiKey}
                        onChange={(e) => setNewGeminiKey(e.target.value)}
                        placeholder="Jika kosong, akan menggunakan key default"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-all text-xs shadow-sm"
                      />
                      <p className="text-[9px] text-slate-500 mt-1 italic">Kosongkan jika ingin menggunakan key Admin/Vercel default.</p>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
                        <input 
                          type="checkbox"
                          checked={newIsActive}
                          onChange={(e) => setNewIsActive(e.target.checked)}
                          className="rounded border-slate-300 bg-white text-purple-600 focus:ring-0"
                        />
                        Status Langsung Aktif
                      </label>
                      <button
                        type="submit"
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1"
                      >
                        <UserPlus size={12} />
                        Daftarkan Pengguna
                      </button>
                    </div>
                  </form>
                </div>

                {/* Registered Users List */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Daftar User Terdaftar ({registeredUsers.length})
                    </h3>
                  </div>

                  {registeredUsers.length === 0 ? (
                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl text-center">
                      <p className="text-xs text-slate-500">Belum ada user yang didaftarkan. Gunakan form di atas untuk menambahkan user pertama.</p>
                    </div>
                  ) : (
                    <div className="max-h-[300px] overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-1 bg-slate-50/50">
                      {registeredUsers.map((user) => (
                        <div 
                          key={user.email}
                          className="bg-white border border-slate-200/80 hover:border-blue-200 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs transition-all shadow-sm"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                              <span className="font-bold text-slate-900">{user.email}</span>
                            </div>
                            <div className="font-mono text-[10px] text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200 flex items-center justify-between gap-1 shadow-inner">
                              <span className="text-blue-700 font-bold select-all">{user.licenseKey}</span>
                              <button 
                                onClick={() => handleCopyText(user.licenseKey, "Token Aktivasi")}
                                className="text-slate-500 hover:text-slate-800"
                                title="Salin Token"
                              >
                                <Copy size={12} />
                              </button>
                            </div>
                            <div className="text-[10px] text-slate-600 flex items-center gap-1.5 mt-1">
                              <span>API Key Gemini:</span>
                              {user.geminiApiKey ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] border border-emerald-100">
                                  <Sparkles size={11} className="text-emerald-600 animate-pulse" /> Terkonfigurasi (Aktif)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-red-700 font-semibold bg-red-50 px-1.5 py-0.5 rounded text-[10px] border border-red-100">
                                  Belum Ada Key
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 justify-end pt-2 md:pt-0 border-t border-slate-100 md:border-0">
                            <button
                              onClick={() => handleToggleUserStatus(user)}
                              className={`p-1 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-semibold ${user.isActive ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                              title={user.isActive ? "Klik untuk Nonaktifkan" : "Klik untuk Aktifkan"}
                            >
                              {user.isActive ? "Aktif" : "Nonaktif"}
                            </button>

                            <button
                              onClick={() => {
                                setEmail(user.email);
                                setUserGeminiKey(user.geminiApiKey || '');
                                setViewMode('user');
                                setSuccessToast("Kredensial disalin ke Form login!");
                                setTimeout(() => setSuccessToast(null), 2500);
                              }}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] transition-colors border border-slate-200"
                              title="Salin ke Form Login"
                            >
                              Gunakan
                            </button>

                            <button
                              onClick={() => handleDeleteUser(user.email)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-lg transition-colors border border-red-100"
                              title="Hapus"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        )}

      </div>

      {/* Main Footer & Developer Info */}
      <footer className="mt-12 text-center text-xs text-slate-500 z-10 flex flex-col items-center gap-1.5 animate-fade-in select-none">
        <div 
          onClick={() => setShowDevModal(true)} 
          className="cursor-pointer transition-colors flex flex-col items-center gap-1 font-medium text-slate-600 hover:text-slate-900"
          title="Tentang Pengembang"
        >
          <span className="font-semibold">RPM Pro © 2026</span>
          <span className="text-slate-500 text-[11px]">Dev | MeyGa</span>
        </div>
      </footer>

      {/* Developer Info Modal (Contains hidden Panel Admin button) */}
      {showDevModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative animate-scale-in text-slate-800">
            <button 
              onClick={() => setShowDevModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="text-center mb-5">
              <div className="mx-auto w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3 border border-blue-100">
                <Bot size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Developer & App Info</h3>
              <p className="text-xs text-slate-500">RPM Pro © 2026</p>
            </div>

            <div className="space-y-4 text-xs text-slate-700 border-t border-b border-slate-100 py-4 mb-6 font-medium">
              <div className="flex justify-between items-start gap-4">
                <span className="text-slate-500">Pengembang:</span>
                <span className="text-right font-bold text-slate-900">Dev | MeyGa</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">WhatsApp:</span>
                <span className="text-right font-mono font-bold text-emerald-600 flex items-center gap-1">
                  <MessageCircle size={14} /> 085604431706
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Versi:</span>
                <span className="font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[10px] border border-blue-100">v1.2.0 (Pro)</span>
              </div>
            </div>

            <div className="space-y-3">
              {viewMode === 'user' ? (
                <button
                  onClick={() => {
                    setViewMode('admin');
                    setShowDevModal(false);
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 border-b-4 border-purple-900 active:border-b-0 active:translate-y-0.5 transition-all rounded-xl py-2.5 font-bold text-white text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-purple-500/10"
                >
                  <Users size={14} /> Masuk Panel Admin
                </button>
              ) : (
                <button
                  onClick={() => {
                    setViewMode('user');
                    setShowDevModal(false);
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 border-b-4 border-blue-900 active:border-b-0 active:translate-y-0.5 transition-all rounded-xl py-2.5 font-bold text-white text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/10"
                >
                  <ShieldCheck size={14} /> Kembali ke Aktivasi
                </button>
              )}

              <button
                onClick={() => setShowDevModal(false)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors border border-slate-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-500 text-slate-900 font-bold px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-fade-in z-50 border border-green-400">
          <Check size={18} />
          <span className="text-sm">{successToast}</span>
        </div>
      )}
      {/* Registration Popup Modal */}
      {showRegistrationPopup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative border border-slate-200">
            <button 
              onClick={() => setShowRegistrationPopup(false)}
              className="absolute top-4 right-4 p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-full transition-colors border border-slate-200"
            >
              <X size={16} />
            </button>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-blue-100">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 font-sans">Terima kasih</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Anda sudah registrasi Email <span className="font-bold text-blue-700 bg-blue-50 px-1 py-0.5 rounded">{email}</span>
              </p>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-5">
                <p className="text-xs text-amber-800 font-medium">
                  Silahkan tunggu verifikasi admin...
                </p>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Hubungi <span className="font-mono text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">085604431706</span>
              </p>
            </div>
            <button
              onClick={() => {
                setShowRegistrationPopup(false);
                setUserStatus('pending');
              }}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3 transition-colors text-sm shadow-sm"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
