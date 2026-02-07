
export type MediaType = 'video' | 'audio' | 'image' | 'document' | 'software' | 'archive';

export interface User {
  username: string;
  avatar: string;
}

export interface Comment {
  id: string;
  username: string;
  avatar: string;
  text: string;
  date: string;
}

export interface MediaFile {
  id: string;
  title: string;
  description: string;
  category: MediaType;
  fileName: string;
  fileSize: string;
  fileUrl: string; // Base64 or Blob URL for session
  thumbnailUrl: string;
  uploader: User;
  uploadDate: string;
  views: number;
  comments: Comment[];
  extension: string;
}

export interface AppState {
  currentUser: User | null;
  files: MediaFile[];
  searchQuery: string;
  activeView: 'feed' | 'channel';
  selectedFile: MediaFile | null;
  isUploadModalOpen: boolean;
}
