
import React from 'react';
import { MediaFile } from '../types';

interface MediaCardProps {
  file: MediaFile;
  onClick: (file: MediaFile) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({ file, onClick }) => {
  const getCategoryIcon = () => {
    switch(file.category) {
      case 'video': return 'fa-play';
      case 'audio': return 'fa-music';
      case 'image': return 'fa-image';
      default: return 'fa-file';
    }
  };

  return (
    <div 
      className="bg-[#1E1E1E] rounded-xl overflow-hidden cursor-pointer hover:bg-[#2A2A2A] transition-all group border border-transparent hover:border-[#3F3F3F]"
      onClick={() => onClick(file)}
    >
      <div className="aspect-video relative overflow-hidden bg-black">
        {file.category === 'image' || file.category === 'video' ? (
            <img 
                src={file.thumbnailUrl} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                alt={file.title}
            />
        ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#272727]">
                <i className={`fa-solid ${getCategoryIcon()} text-4xl text-gray-500`}></i>
            </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <i className="fa-solid fa-play text-white text-3xl"></i>
        </div>
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-bold">
            {file.extension.toUpperCase()}
        </div>
      </div>
      
      <div className="p-4 flex space-x-3">
        <img src={file.uploader.avatar} className="w-10 h-10 rounded-full border border-gray-700" alt="avatar" />
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium text-base truncate leading-tight mb-1 group-hover:text-red-400 transition-colors">
            {file.title}
          </h3>
          <p className="text-[#AAAAAA] text-sm hover:text-white transition-colors">{file.uploader.username}</p>
          <div className="flex items-center text-[#AAAAAA] text-xs mt-1 space-x-2">
            <span>{file.views.toLocaleString()} views</span>
            <span>•</span>
            <span>{file.uploadDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
