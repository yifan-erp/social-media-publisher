import { create } from 'zustand';

interface Content {
  id: string;
  type: 'video' | 'image' | 'text';
  title: string;
  description: string;
  file?: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'published' | 'scheduled';
}

interface ContentStore {
  contents: Content[];
  currentContent: Content | null;
  loading: boolean;
  addContent: (content: Content) => void;
  updateContent: (id: string, content: Partial<Content>) => void;
  deleteContent: (id: string) => void;
  setCurrentContent: (content: Content | null) => void;
  getContents: () => Content[];
}

export const useContentStore = create<ContentStore>((set, get) => ({
  contents: [],
  currentContent: null,
  loading: false,

  addContent: (content: Content) =>
    set((state) => ({
      contents: [...state.contents, content],
    })),

  updateContent: (id: string, updates: Partial<Content>) =>
    set((state) => ({
      contents: state.contents.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c
      ),
      currentContent:
        state.currentContent?.id === id
          ? { ...state.currentContent, ...updates, updatedAt: new Date() }
          : state.currentContent,
    })),

  deleteContent: (id: string) =>
    set((state) => ({
      contents: state.contents.filter((c) => c.id !== id),
      currentContent:
        state.currentContent?.id === id ? null : state.currentContent,
    })),

  setCurrentContent: (content: Content | null) =>
    set({ currentContent: content }),

  getContents: () => get().contents,
}));
