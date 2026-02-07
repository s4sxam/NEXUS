
import React, { useState } from 'react';
import { MediaFile } from '../types';

interface FileHandlerProps {
  file: MediaFile;
  theaterMode?: boolean;
}

export const FileHandler: React.FC<FileHandlerProps> = ({ file, theaterMode }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const renderVideoPlayer = () => (
    <div className={`relative w-full bg-black rounded-lg overflow-hidden group ${theaterMode ? 'aspect-video' : 'aspect-video'}`}>
      <video 
        className="w-full h-full object-contain"
        controls
        src={file.fileUrl}
        poster={file.thumbnailUrl}
      />
    </div>
  );

  const renderAudioPlayer = () => (
    <div className="w-full bg-[#1A1A1A] p-8 rounded-xl flex flex-col items-center justify-center space-y-6 border border-[#333]">
      <div className="w-48 h-48 bg-gradient-to-br from-red-600 to-orange-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
        <i className="fa-solid fa-music text-6xl text-white"></i>
      </div>
      <div className="w-full space-y-4">
        <div className="flex items-center justify-center space-x-1 h-12">
            {[...Array(40)].map((_, i) => (
                <div 
                    key={i} 
                    className={`w-1 bg-red-500 rounded-full transition-all duration-300 ${isPlaying ? 'animate-bounce' : 'h-2 opacity-50'}`}
                    style={{ 
                        height: isPlaying ? `${Math.random() * 100}%` : '8px',
                        animationDelay: `${i * 0.05}s`
                    }}
                />
            ))}
        </div>
        <audio 
            className="w-full custom-audio" 
            controls 
            src={file.fileUrl} 
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
        />
      </div>
    </div>
  );

  const renderImageLightbox = () => (
    <div className="w-full bg-[#1A1A1A] rounded-lg overflow-hidden flex items-center justify-center p-4">
      <img 
        src={file.fileUrl} 
        alt={file.title} 
        className="max-w-full max-h-[80vh] object-contain shadow-2xl rounded"
      />
    </div>
  );

  const renderDocumentCard = () => {
    const getIcon = () => {
        switch(file.category) {
            case 'software': return 'fa-laptop-code';
            case 'archive': return 'fa-file-zipper';
            default: return 'fa-file-lines';
        }
    };

    return (
        <div className="w-full bg-[#272727] p-12 rounded-xl flex flex-col items-center justify-center space-y-6 border border-[#3F3F3F]">
            <div className="w-32 h-32 bg-[#3F3F3F] rounded-2xl flex items-center justify-center">
                <i className={`fa-solid ${getIcon()} text-6xl text-red-500`}></i>
            </div>
            <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">{file.fileName}</h3>
                <p className="text-gray-400">File Type: {file.extension.toUpperCase()}</p>
                <p className="text-gray-400">Size: {file.fileSize}</p>
            </div>
            <a 
                href={file.fileUrl} 
                download={file.fileName}
                className="bg-white text-black px-8 py-3 rounded-full font-bold flex items-center space-x-2 hover:bg-gray-200 transition-colors"
            >
                <i className="fa-solid fa-download"></i>
                <span>DOWNLOAD FILE</span>
            </a>
        </div>
    );
  };

  switch (file.category) {
    case 'video':
      return renderVideoPlayer();
    case 'audio':
      return renderAudioPlayer();
    case 'image':
      return renderImageLightbox();
    default:
      return renderDocumentCard();
  }
};
