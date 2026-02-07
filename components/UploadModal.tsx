
import React, { useState, useRef } from 'react';
import { User, MediaFile, MediaType } from '../types';
import { GoogleGenAI } from "@google/genai";

interface UploadModalProps {
  onClose: () => void;
  onUpload: (file: MediaFile) => void;
  currentUser: User;
}

export const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUpload, currentUser }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MediaType>('video');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAiEnhance = async () => {
    if (!file) return;
    setIsAiThinking(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analyze this file metadata: Name: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes. 
      Generate a professional, futuristic "NexusHub" title and a detailed, engaging description (max 200 words). 
      Format the output as JSON with keys "title" and "description".`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const data = JSON.parse(response.text);
      if (data.title) setTitle(data.title);
      if (data.description) setDescription(data.description);
    } catch (error) {
      console.error("AI Enhancement failed:", error);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleFiles = (f: File) => {
    setFile(f);
    setTitle(f.name.split('.')[0]);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);

    if (f.type.startsWith('video/')) setCategory('video');
    else if (f.type.startsWith('audio/')) setCategory('audio');
    else if (f.type.startsWith('image/')) setCategory('image');
    else if (f.type.includes('zip') || f.type.includes('rar')) setCategory('archive');
    else if (f.type.includes('pdf') || f.type.includes('text')) setCategory('document');
    else setCategory('software');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !previewUrl) return;

    const newFile: MediaFile = {
      id: Date.now().toString(),
      title,
      description,
      category,
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      fileUrl: previewUrl,
      thumbnailUrl: category === 'image' || category === 'video' ? previewUrl : `https://picsum.photos/seed/${title}/400/225`,
      uploader: currentUser,
      uploadDate: new Date().toLocaleDateString(),
      views: 0,
      comments: [],
      extension: file.name.split('.').pop() || 'file'
    };

    onUpload(newFile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#1E1E1E] w-full max-w-4xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh] border border-[#333] shadow-2xl">
        <div className="p-6 border-b border-[#333] flex justify-between items-center bg-[#252525]">
          <h2 className="text-2xl font-bold font-futuristic text-red-500 flex items-center gap-3">
             <i className="fa-solid fa-cloud-arrow-up"></i>
             Nexus Uploader
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <i className="fa-solid fa-xmark text-2xl"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {!file ? (
            <div 
              className={`border-4 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center space-y-6 transition-all cursor-pointer ${dragActive ? 'border-red-600 bg-red-600/10 scale-[0.98]' : 'border-[#333] bg-[#272727] hover:border-red-600/50'}`}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files[0]); }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => e.target.files?.[0] && handleFiles(e.target.files[0])} />
              <div className="w-24 h-24 bg-[#333] rounded-full flex items-center justify-center shadow-inner group">
                <i className="fa-solid fa-upload text-5xl text-gray-500 group-hover:text-red-500 transition-colors"></i>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">Transmit Data to Nexus</p>
                <p className="text-gray-500 mt-2">Drag and drop or click to select files</p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-[#333] shadow-2xl relative group">
                  {category === 'image' || category === 'video' ? (
                    <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                        <i className="fa-solid fa-file-invoice text-7xl text-red-500/20"></i>
                        <span className="text-sm font-mono text-gray-500">{file.name}</span>
                    </div>
                  )}
                  <button onClick={() => setFile(null)} className="absolute top-4 right-4 bg-black/60 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
                
                <div className="bg-[#272727] p-5 rounded-2xl border border-[#333] flex items-center justify-between">
                    <div>
                        <p className="font-bold text-sm text-gray-400">FILE METRICS</p>
                        <p className="text-lg font-mono">{ (file.size / (1024 * 1024)).toFixed(2) } MB</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-sm text-gray-400">EXTENSION</p>
                        <p className="text-lg font-mono uppercase text-red-500">{ file.name.split('.').pop() }</p>
                    </div>
                </div>

                <button 
                  type="button"
                  onClick={handleAiEnhance}
                  disabled={isAiThinking}
                  className="w-full bg-gradient-to-r from-purple-600 to-red-600 p-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all disabled:opacity-50 group"
                >
                  {isAiThinking ? (
                    <>
                      <i className="fa-solid fa-circle-notch animate-spin"></i>
                      <span>NEURAL PROCESSING...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-wand-magic-sparkles group-hover:animate-bounce"></i>
                      <span>ENHANCE WITH NEXUS AI</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 tracking-widest uppercase">Title</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#121212] border border-[#333] rounded-xl p-4 text-white focus:border-red-600 outline-none transition-all font-medium"
                    placeholder="Exchange Title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 tracking-widest uppercase">Protocol Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MediaType)}
                    className="w-full bg-[#121212] border border-[#333] rounded-xl p-4 focus:border-red-600 outline-none appearance-none cursor-pointer"
                  >
                    <option value="video">🎞️ Video Stream</option>
                    <option value="audio">🎵 Sonic Waveform</option>
                    <option value="image">🖼️ Visual Asset</option>
                    <option value="document">📄 Binary Document</option>
                    <option value="software">💾 Core Software</option>
                    <option value="archive">📦 Data Archive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 tracking-widest uppercase">Transmission Log (Description)</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#121212] border border-[#333] rounded-xl p-4 h-40 focus:border-red-600 outline-none resize-none transition-all leading-relaxed"
                    placeholder="Detail the contents of this data exchange..."
                  ></textarea>
                </div>
              </div>
            </div>
          )}
        </div>

        {file && (
          <div className="p-6 border-t border-[#333] flex justify-end gap-4 bg-[#252525]">
            <button onClick={onClose} className="px-8 py-3 rounded-xl font-bold text-gray-400 hover:text-white transition-colors">ABORT</button>
            <button 
              onClick={handleSubmit}
              className="bg-red-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 flex items-center gap-3"
            >
              <i className="fa-solid fa-satellite-dish"></i>
              INITIALIZE UPLOAD
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
