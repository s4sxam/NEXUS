
import React, { useState, useEffect, useMemo } from 'react';
import { User, MediaFile, AppState, Comment } from './types';
import { storageService } from './services/storageService';
import { MediaCard } from './components/MediaCard';
import { UploadModal } from './components/UploadModal';
import { FileHandler } from './components/FileHandler';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentUser: storageService.getUser(),
    files: [],
    searchQuery: '',
    activeView: 'feed',
    selectedFile: null,
    isUploadModalOpen: false,
  });

  const [usernameInput, setUsernameInput] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [theaterMode, setTheaterMode] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);

  useEffect(() => {
    const savedFiles = storageService.getFiles();
    if (savedFiles.length === 0) {
      const mockUploader: User = { username: 'NexusSystem', avatar: 'https://robohash.org/nexus' };
      const mockFiles: MediaFile[] = [
        {
          id: '1',
          title: 'Quantum Transmission v1',
          description: 'A visual representation of data packets traveling through the Nexus core.',
          category: 'video',
          fileName: 'nexus_core.mp4',
          fileSize: '15.4 MB',
          fileUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
          thumbnailUrl: 'https://picsum.photos/seed/quantum/800/450',
          uploader: mockUploader,
          uploadDate: '2023-10-01',
          views: 1254,
          comments: [],
          extension: 'mp4'
        },
        {
          id: '2',
          title: 'Binary Rain (Ambient)',
          description: 'Soothing digital soundscape for focused work.',
          category: 'audio',
          fileName: 'binary_rain.mp3',
          fileSize: '8.2 MB',
          fileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          thumbnailUrl: 'https://picsum.photos/seed/audio/800/450',
          uploader: { username: 'CyberMancer', avatar: 'https://robohash.org/cyber' },
          uploadDate: '2023-11-15',
          views: 890,
          comments: [],
          extension: 'mp3'
        }
      ];
      setState(prev => ({ ...prev, files: mockFiles }));
      storageService.saveFiles(mockFiles);
    } else {
      setState(prev => ({ ...prev, files: savedFiles }));
    }
  }, []);

  const fetchAiInsight = async (file: MediaFile) => {
    setIsAiAnalyzing(true);
    setAiInsight(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Provide a short, 2-sentence "Nexus Insight" for this file: Title: ${file.title}, Description: ${file.description}. Make it sound like a high-tech analysis from a digital hub.`
      });
      setAiInsight(response.text);
    } catch (error) {
      setAiInsight("Neural link failed. Unable to generate insight.");
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    const user: User = { username: usernameInput, avatar: `https://robohash.org/${usernameInput}` };
    setState(prev => ({ ...prev, currentUser: user }));
    storageService.saveUser(user);
  };

  const handleLogout = () => {
    setState(prev => ({ ...prev, currentUser: null, activeView: 'feed' }));
    storageService.saveUser(null);
  };

  const handleUpload = (newFile: MediaFile) => {
    const updatedFiles = [newFile, ...state.files];
    setState(prev => ({ ...prev, files: updatedFiles, isUploadModalOpen: false }));
    storageService.saveFiles(updatedFiles);
  };

  const handleSelectFile = (file: MediaFile) => {
    const updatedFiles = state.files.map(f => f.id === file.id ? { ...f, views: f.views + 1 } : f);
    setState(prev => ({ ...prev, files: updatedFiles, selectedFile: { ...file, views: file.views + 1 } }));
    storageService.saveFiles(updatedFiles);
    fetchAiInsight(file);
  };

  const handlePostComment = () => {
    if (!commentInput.trim() || !state.currentUser || !state.selectedFile) return;
    const newComment: Comment = {
        id: Date.now().toString(),
        username: state.currentUser.username,
        avatar: state.currentUser.avatar,
        text: commentInput,
        date: 'Just now'
    };
    const updatedFile = { ...state.selectedFile, comments: [newComment, ...state.selectedFile.comments] };
    const updatedFiles = state.files.map(f => f.id === updatedFile.id ? updatedFile : f);
    setState(prev => ({ ...prev, files: updatedFiles, selectedFile: updatedFile }));
    setCommentInput('');
    storageService.saveFiles(updatedFiles);
  };

  const filteredFiles = useMemo(() => {
    let list = state.files;
    if (state.activeView === 'channel' && state.currentUser) list = list.filter(f => f.uploader.username === state.currentUser?.username);
    if (state.searchQuery) list = list.filter(f => f.title.toLowerCase().includes(state.searchQuery.toLowerCase()));
    return list;
  }, [state.files, state.activeView, state.searchQuery, state.currentUser]);

  if (!state.currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F] p-4 font-inter">
        <div className="max-w-md w-full bg-[#1E1E1E] p-12 rounded-[2rem] shadow-2xl border border-[#333] text-center space-y-10 animate-in zoom-in duration-700">
          <div className="space-y-4">
            <h1 className="text-5xl font-futuristic font-bold text-red-600 tracking-tighter drop-shadow-[0_0_15px_rgba(220,38,38,0.3)]">NEXUS</h1>
            <p className="text-gray-400 font-medium tracking-wide">AUTHENTICATE TO COMMENCE EXCHANGE</p>
          </div>
          <div className="w-40 h-40 bg-gradient-to-b from-[#272727] to-[#121212] rounded-full mx-auto flex items-center justify-center border-4 border-red-600/10 shadow-2xl">
             <i className="fa-solid fa-microchip text-6xl text-red-600 animate-pulse"></i>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <input 
              type="text" 
              placeholder="Designate Username" 
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="w-full bg-[#121212] border border-[#333] rounded-2xl p-5 text-white focus:border-red-600 outline-none transition-all placeholder:text-gray-700 font-mono"
              required
            />
            <button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-5 rounded-2xl shadow-xl shadow-red-600/30 transition-all hover:scale-[1.03] active:scale-95 uppercase tracking-widest"
            >
              INITIALIZE CONNECTION
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      <nav className="fixed top-0 w-full bg-[#0F0F0F]/90 backdrop-blur-xl z-50 border-b border-[#272727] transition-all duration-500">
        <div className="max-w-[1920px] mx-auto px-6 h-20 flex items-center justify-between">
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setState(prev => ({ ...prev, activeView: 'feed', selectedFile: null }))}
          >
            <div className="w-11 h-11 bg-red-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-red-600/20">
                <i className="fa-solid fa-bolt text-white text-2xl"></i>
            </div>
            <span className="text-3xl font-futuristic font-bold tracking-tighter hidden md:block">NEXUS</span>
          </div>

          <div className="hidden md:flex flex-1 max-w-2xl mx-12">
            <div className="relative w-full group">
                <input 
                  type="text" 
                  placeholder="Scan Nexus for data assets..." 
                  value={state.searchQuery}
                  onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
                  className="w-full bg-[#121212] border border-[#272727] rounded-full px-8 py-3 pl-14 focus:border-red-600 outline-none transition-all group-hover:border-[#3F3F3F]"
                />
                <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-500"></i>
            </div>
          </div>

          <div className="flex items-center space-x-8">
            <button 
                onClick={() => setState(prev => ({ ...prev, isUploadModalOpen: true }))}
                className="bg-red-600 text-white px-6 py-2.5 rounded-full font-bold flex items-center space-x-2 hover:bg-red-700 transition-all shadow-xl shadow-red-600/10 hover:shadow-red-600/30"
            >
                <i className="fa-solid fa-cloud-arrow-up"></i>
                <span className="hidden sm:inline">UPLOAD</span>
            </button>
            <div className="relative group">
                <div className="flex items-center gap-3 cursor-pointer">
                    <img src={state.currentUser.avatar} className="w-11 h-11 rounded-full border-2 border-[#333] group-hover:border-red-600 transition-all" alt="pfp" />
                    <i className="fa-solid fa-chevron-down text-gray-500 text-xs group-hover:rotate-180 transition-transform"></i>
                </div>
                <div className="absolute right-0 top-full pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                    <div className="bg-[#1E1E1E] border border-[#272727] rounded-2xl shadow-2xl p-3 w-56">
                        <div className="p-4 border-b border-[#272727] mb-2">
                            <p className="font-bold text-lg truncate text-red-500">{state.currentUser.username}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Elite Nexus Tier</p>
                        </div>
                        <button onClick={() => setState(prev => ({ ...prev, activeView: 'channel', selectedFile: null }))} className="w-full text-left p-4 hover:bg-[#272727] rounded-xl transition-colors flex items-center gap-4">
                            <i className="fa-solid fa-user-gear text-gray-500"></i>
                            <span className="font-medium">My Channel</span>
                        </button>
                        <button onClick={handleLogout} className="w-full text-left p-4 hover:bg-red-600/10 text-red-500 rounded-xl transition-colors flex items-center gap-4">
                            <i className="fa-solid fa-power-off"></i>
                            <span className="font-medium">Disconnect</span>
                        </button>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 px-6 md:px-12 max-w-[1920px] mx-auto pb-24">
        {state.activeView === 'channel' && (
            <div className="mb-12 p-12 rounded-[2.5rem] bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-[#272727] flex items-center space-x-12 shadow-2xl animate-in slide-in-from-top-10 duration-700">
                <div className="relative">
                    <img src={state.currentUser.avatar} className="w-40 h-40 rounded-full ring-8 ring-red-600/10 shadow-2xl" alt="c" />
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-red-600 rounded-full flex items-center justify-center border-4 border-[#1A1A1A]">
                        <i className="fa-solid fa-check text-white"></i>
                    </div>
                </div>
                <div className="space-y-3">
                    <h1 className="text-5xl font-bold tracking-tight">{state.currentUser.username}</h1>
                    <div className="flex items-center space-x-6 text-gray-400 font-medium">
                        <span className="flex items-center gap-2"><i className="fa-solid fa-database text-red-500"></i> {filteredFiles.length} Exchanges</span>
                        <span className="flex items-center gap-2"><i className="fa-solid fa-bolt text-red-500"></i> Active Status</span>
                    </div>
                </div>
            </div>
        )}

        <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold font-futuristic flex items-center gap-4">
                <div className="w-2 h-8 bg-red-600 rounded-full"></div>
                {state.activeView === 'channel' ? 'YOUR TRANSMISSIONS' : 'TRENDING ASSETS'}
            </h2>
            <div className="bg-[#1A1A1A] p-1.5 rounded-full border border-[#272727] flex space-x-1">
                 {['All', 'Video', 'Audio', 'Binary'].map(cat => (
                     <button key={cat} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${cat === 'All' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-[#272727]'}`}>{cat}</button>
                 ))}
            </div>
        </div>

        {filteredFiles.length === 0 ? (
            <div className="h-[60vh] flex flex-col items-center justify-center text-gray-600 space-y-6">
                <i className="fa-solid fa-satellite text-8xl opacity-10 animate-pulse"></i>
                <p className="text-2xl font-light">No data found in this sector.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                {filteredFiles.map(file => (
                    <MediaCard key={file.id} file={file} onClick={handleSelectFile} />
                ))}
            </div>
        )}
      </main>

      {state.selectedFile && (
        <div className="fixed inset-0 z-[100] bg-[#0A0A0A] overflow-y-auto animate-in fade-in duration-500">
          <div className="sticky top-0 h-20 bg-[#0A0A0A]/95 backdrop-blur-2xl px-8 flex items-center justify-between border-b border-[#272727] z-[110]">
             <div className="flex items-center gap-6">
                <button onClick={() => setState(prev => ({ ...prev, selectedFile: null }))} className="w-12 h-12 rounded-2xl bg-[#1A1A1A] hover:bg-red-600 flex items-center justify-center transition-all">
                    <i className="fa-solid fa-chevron-left text-xl"></i>
                </button>
                <h2 className="font-futuristic font-bold text-xl tracking-widest text-red-500">EXCHANGE VIEW</h2>
             </div>
             <div className="flex items-center gap-4">
                <button onClick={() => setTheaterMode(!theaterMode)} className={`px-6 py-2.5 rounded-xl font-bold transition-all ${theaterMode ? 'bg-red-600' : 'bg-[#1A1A1A] text-gray-400'}`}>
                    <i className="fa-solid fa-arrows-alt-h mr-2"></i> Theater Mode
                </button>
             </div>
          </div>

          <div className={`max-w-[1800px] mx-auto p-6 md:p-12 flex flex-col ${theaterMode ? 'lg:flex-col' : 'lg:flex-row'} gap-12`}>
            <div className={theaterMode ? 'w-full' : 'lg:w-[70%]'}>
              <div className="rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-black border border-[#272727]">
                <FileHandler file={state.selectedFile} theaterMode={theaterMode} />
              </div>
              <div className="mt-8 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-4xl font-bold tracking-tight">{state.selectedFile.title}</h1>
                    <div className="flex gap-4">
                        <button className="bg-[#1A1A1A] p-4 rounded-2xl hover:bg-red-600 transition-colors"><i className="fa-regular fa-bookmark"></i></button>
                        <button className="bg-[#1A1A1A] p-4 rounded-2xl hover:bg-red-600 transition-colors"><i className="fa-solid fa-share"></i></button>
                    </div>
                </div>

                {/* AI INSIGHT PANEL */}
                <div className="bg-gradient-to-r from-red-600/10 to-transparent border-l-4 border-red-600 p-6 rounded-r-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                    <div className="relative flex items-start gap-4">
                        <div className="bg-red-600 p-3 rounded-xl shadow-lg shadow-red-600/20">
                            <i className={`fa-solid ${isAiAnalyzing ? 'fa-circle-notch animate-spin' : 'fa-brain'} text-white`}></i>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-red-500 mb-2">Nexus Neural Insight</h4>
                            <p className="text-lg text-gray-200 font-medium leading-relaxed italic">
                                {isAiAnalyzing ? "Analyzing transmission data..." : aiInsight || "Establishing neural link..."}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-[#121212] rounded-3xl p-8 border border-[#272727]">
                    <div className="flex items-center gap-6 mb-8 border-b border-[#272727] pb-8">
                        <img src={state.selectedFile.uploader.avatar} className="w-16 h-16 rounded-full border-2 border-red-600/30" alt="u" />
                        <div className="flex-1">
                            <p className="text-2xl font-bold">{state.selectedFile.uploader.username}</p>
                            <p className="text-sm text-gray-500 font-mono tracking-tighter">Verified Nexus Contributor</p>
                        </div>
                        <button className="bg-white text-black px-10 py-3 rounded-full font-bold hover:bg-gray-200 transition-all uppercase tracking-widest text-sm">Follow</button>
                    </div>
                    <p className="text-gray-400 leading-loose text-lg font-light">
                        {state.selectedFile.description}
                    </p>
                </div>
              </div>
            </div>

            <div className={`${theaterMode ? 'w-full' : 'lg:w-[30%]'}`}>
                <div className="space-y-8">
                    <h3 className="font-futuristic font-bold text-xl flex items-center gap-3"><i className="fa-solid fa-link text-red-600"></i> RELATED EXCHANGES</h3>
                    <div className="grid grid-cols-1 gap-6">
                        {state.files.filter(f => f.id !== state.selectedFile?.id).slice(0, 6).map(f => (
                            <div key={f.id} onClick={() => handleSelectFile(f)} className="flex gap-4 cursor-pointer group hover:bg-[#1A1A1A] p-2 rounded-2xl transition-all">
                                <div className="w-32 h-20 bg-black rounded-xl overflow-hidden flex-shrink-0 relative">
                                    <img src={f.thumbnailUrl || `https://picsum.photos/seed/${f.id}/400/225`} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" alt="next" />
                                    <div className="absolute bottom-1 right-1 bg-black/80 text-[10px] px-2 py-0.5 rounded font-bold">{f.extension.toUpperCase()}</div>
                                </div>
                                <div className="flex-1 min-w-0 py-1">
                                    <h4 className="font-bold text-sm line-clamp-2 leading-tight group-hover:text-red-500 transition-colors">{f.title}</h4>
                                    <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-tighter">{f.uploader.username}</p>
                                    <div className="text-[10px] text-gray-600 mt-1 flex items-center gap-2">
                                        <span>{f.views} Views</span>
                                        <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
                                        <span>{f.uploadDate}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}

      {state.isUploadModalOpen && <UploadModal currentUser={state.currentUser} onClose={() => setState(prev => ({ ...prev, isUploadModalOpen: false }))} onUpload={handleUpload} />}
    </div>
  );
};

export default App;
