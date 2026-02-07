
import { MediaFile, User } from '../types';

const FILES_KEY = 'nexushub_files';
const USER_KEY = 'nexushub_user';

export const storageService = {
  saveFiles: (files: MediaFile[]) => {
    // We only save metadata to localStorage to avoid quota limits
    // In a real app, fileUrl would be a CDN link
    localStorage.setItem(FILES_KEY, JSON.stringify(files));
  },

  getFiles: (): MediaFile[] => {
    const data = localStorage.getItem(FILES_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveUser: (user: User | null) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser: (): User | null => {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  }
};
