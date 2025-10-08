import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  genre: string;
  mood: string;
  templateStructure: Record<string, any>;
}

interface PromptCollection {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  promptCount: number;
  createdAt: string;
  updatedAt: string;
}

interface PromptVersion {
  id: string;
  versionNumber: number;
  basePrompt: string;
  refinedPrompt: string;
  genre: string;
  mood: string;
  tempo?: number;
  instrumentation?: string[];
  style?: string;
  structure?: Record<string, any>;
  optimizationLevel: string;
  targetPlatforms: string[];
  tags: string[];
  changelog: string;
  createdAt: string;
}

interface PromptAnalytics {
  id: string;
  platform: string;
  generationSuccess: boolean;
  generationQuality?: number;
  generationTime?: number;
  feedbackText?: string;
  rating?: number;
  createdAt: string;
}

interface Prompt {
  id: string;
  title: string;
  basePrompt: string;
  refinedPrompt: string;
  genre: string;
  mood: string;
  tempo?: number;
  instrumentation?: string[];
  style?: string;
  structure?: Record<string, any>;
  optimizationLevel: string;
  targetPlatforms: string[];
  tags: string[];
  effectivenessScore?: number;
  isFavorite: boolean;
  isPublic: boolean;
  version: number;
  versions?: PromptVersion[];
  analytics?: PromptAnalytics[];
  likeCount: number;
  collectionId?: string;
  collectionName?: string;
  createdAt: string;
  updatedAt: string;
}

interface PromptState {
  // State
  prompts: Prompt[];
  collections: PromptCollection[];
  templates: PromptTemplate[];
  currentPrompt: Prompt | null;
  isLoading: boolean;
  error: string | null;
  isRewriting: boolean;
  rewriteHistory: Prompt[];
  
  // Form state
  formState: {
    basePrompt: string;
    genre: string;
    mood: string;
    tempo: string;
    instrumentation: string[];
    style: string;
    optimizationLevel: string;
    targetPlatforms: string[];
    tags: string[];
  };
  
  // UI state
  uiState: {
    activeTab: 'rewrite' | 'manage' | 'templates' | 'analytics';
    selectedPrompt: string | null;
    selectedCollection: string | null;
    searchQuery: string;
    sortBy: 'created_at' | 'updated_at' | 'effectiveness_score' | 'title';
    sortOrder: 'asc' | 'desc';
    filters: {
      genre: string;
      mood: string;
      optimizationLevel: string;
      collectionId: string;
    };
  };

  // Actions
  // Form actions
  updateFormState: (updates: Partial<PromptState['formState']>) => void;
  resetForm: () => void;
  
  // Prompt actions
  fetchPrompts: () => Promise<void>;
  fetchPrompt: (id: string) => Promise<void>;
  createPrompt: (promptData: Partial<Prompt>) => Promise<void>;
  updatePrompt: (id: string, updates: Partial<Prompt>) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  toggleLike: (id: string) => Promise<void>;
  
  // Rewrite actions
  rewritePrompt: () => Promise<void>;
  saveRewrite: (title: string, collectionId?: string) => Promise<void>;
  
  // Collection actions
  fetchCollections: () => Promise<void>;
  createCollection: (collectionData: Partial<PromptCollection>) => Promise<void>;
  updateCollection: (id: string, updates: Partial<PromptCollection>) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  
  // Template actions
  fetchTemplates: () => Promise<void>;
  useTemplate: (template: PromptTemplate) => void;
  
  // Analytics actions
  fetchAnalytics: (promptId: string) => Promise<void>;
  addAnalytics: (promptId: string, analytics: Partial<PromptAnalytics>) => Promise<void>;
  
  // Export actions
  exportPrompt: (id: string, platform: string, format?: string) => Promise<string>;
  
  // UI actions
  setActiveTab: (tab: PromptState['uiState']['activeTab']) => void;
  setSelectedPrompt: (id: string | null) => void;
  setSelectedCollection: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: PromptState['uiState']['sortBy']) => void;
  setSortOrder: (sortOrder: PromptState['uiState']['sortOrder']) => void;
  setFilter: (filter: keyof PromptState['uiState']['filters'], value: string) => void;
  clearFilters: () => void;
  
  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Loading state
  setLoading: (loading: boolean) => void;
  setRewriting: (rewriting: boolean) => void;
}

// Default form state
const defaultFormState = {
  basePrompt: '',
  genre: 'Electronic',
  mood: 'Energetic',
  tempo: '',
  instrumentation: [],
  style: '',
  optimizationLevel: 'standard',
  targetPlatforms: ['suno'],
  tags: [],
};

// Default UI state
const defaultUIState = {
  activeTab: 'rewrite',
  selectedPrompt: null,
  selectedCollection: null,
  searchQuery: '',
  sortBy: 'created_at',
  sortOrder: 'desc',
  filters: {
    genre: '',
    mood: '',
    optimizationLevel: '',
    collectionId: '',
  },
};

export const usePromptStore = create<PromptState>()(
  persist(
    (set, get) => ({
      // Initial state
      prompts: [],
      collections: [],
      templates: [],
      currentPrompt: null,
      isLoading: false,
      error: null,
      isRewriting: false,
      rewriteHistory: [],
      
      formState: { ...defaultFormState },
      uiState: { ...defaultUIState },
      
      // Form actions
      updateFormState: (updates) => {
        set((state) => ({
          formState: { ...state.formState, ...updates }
        }));
      },
      
      resetForm: () => {
        set({
          formState: { ...defaultFormState },
          currentPrompt: null,
        });
      },
      
      // API helper function
      apiCall: async (endpoint: string, options: RequestInit = {}) => {
        const { userId } = useUserStore.getState();
        const token = useClerkUser?.(); // This would be from Clerk context
        
        const response = await fetch(`/api${endpoint}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          ...options,
        });
        
        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || 'API request failed');
        }
        
        return response.json();
      },
      
      // Prompt actions
      fetchPrompts: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const { uiState } = get();
          const params = new URLSearchParams({
            page: '1',
            limit: '50',
            sortBy: uiState.sortBy,
            sortOrder: uiState.sortOrder,
          });
          
          // Add filters
          Object.entries(uiState.filters).forEach(([key, value]) => {
            if (value) params.append(key, value);
          });
          
          if (uiState.searchQuery) {
            params.append('search', uiState.searchQuery);
          }
          
          const response = await get().apiCall(`/prompts?${params}`);
          
          set({
            prompts: response.prompts || [],
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch prompts',
            isLoading: false,
          });
        }
      },
      
      fetchPrompt: async (id: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await get().apiCall(`/prompts/${id}`);
          
          set({
            currentPrompt: response.prompt || null,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch prompt',
            isLoading: false,
          });
        }
      },
      
      createPrompt: async (promptData) => {
        try {
          set({ isLoading: true, error: null });
          
          const { formState } = get();
          const prompt = {
            title: promptData.title || 'Untitled Prompt',
            basePrompt: formState.basePrompt,
            refinedPrompt: formState.refinedPrompt || formState.basePrompt,
            genre: formState.genre,
            mood: formState.mood,
            tempo: formState.tempo ? parseInt(formState.tempo) : undefined,
            instrumentation: formState.instrumentation,
            style: formState.style,
            optimizationLevel: formState.optimizationLevel,
            targetPlatforms: formState.targetPlatforms,
            tags: formState.tags,
            collectionId: promptData.collectionId,
          };
          
          const response = await get().apiCall('/prompts', {
            method: 'POST',
            body: JSON.stringify(prompt),
          });
          
          if (response.success) {
            set((state) => ({
              prompts: [response.prompt, ...state.prompts],
              currentPrompt: response.prompt,
              isLoading: false,
            }));
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to create prompt',
            isLoading: false,
          });
        }
      },
      
      updatePrompt: async (id: string, updates) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await get().apiCall(`/prompts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
          });
          
          if (response.success) {
            set((state) => ({
              prompts: state.prompts.map(p => 
                p.id === id ? response.prompt : p
              ),
              currentPrompt: state.currentPrompt?.id === id 
                ? response.prompt 
                : state.currentPrompt,
              isLoading: false,
            }));
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update prompt',
            isLoading: false,
          });
        }
      },
      
      deletePrompt: async (id: string) => {
        try {
          set({ isLoading: true, error: null });
          
          await get().apiCall(`/prompts/${id}`, {
            method: 'DELETE',
          });
          
          set((state) => ({
            prompts: state.prompts.filter(p => p.id !== id),
            currentPrompt: state.currentPrompt?.id === id ? null : state.currentPrompt,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete prompt',
            isLoading: false,
          });
        }
      },
      
      toggleFavorite: async (id: string) => {
        try {
          const prompt = get().prompts.find(p => p.id === id);
          if (!prompt) return;
          
          await get().updatePrompt(id, { isFavorite: !prompt.isFavorite });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to toggle favorite',
          });
        }
      },
      
      toggleLike: async (id: string) => {
        try {
          await get().apiCall(`/prompts/${id}/like`, {
            method: 'POST',
          });
          
          // Update local state
          set((state) => ({
            prompts: state.prompts.map(p => 
              p.id === id 
                ? { ...p, likeCount: p.likeCount + (p.likeCount >= 0 ? 1 : -1) }
                : p
            ),
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to toggle like',
          });
        }
      },
      
      // Rewrite actions
      rewritePrompt: async () => {
        try {
          const { formState } = get();
          
          set({ isRewriting: true, error: null });
          
          const response = await get().apiCall('/prompts/rewrite', {
            method: 'POST',
            body: JSON.stringify({
              basePrompt: formState.basePrompt,
              genre: formState.genre,
              mood: formState.mood,
              tempo: formState.tempo ? parseInt(formState.tempo) : undefined,
              instrumentation: formState.instrumentation,
              style: formState.style,
              optimizationLevel: formState.optimizationLevel,
              targetPlatforms: formState.targetPlatforms,
            }),
          });
          
          if (response.success) {
            // Update form with refined prompt
            get().updateFormState({ refinedPrompt: response.refinedPrompt });
            
            // Add to rewrite history
            set((state) => ({
              rewriteHistory: [
                {
                  id: `temp-${Date.now()}`,
                  title: 'Rewrite Result',
                  basePrompt: formState.basePrompt,
                  refinedPrompt: response.refinedPrompt,
                  genre: formState.genre,
                  mood: formState.mood,
                  tempo: formState.tempo ? parseInt(formState.tempo) : undefined,
                  instrumentation: formState.instrumentation,
                  style: formState.style,
                  optimizationLevel: formState.optimizationLevel,
                  targetPlatforms: formState.targetPlatforms,
                  tags: formState.tags,
                  effectivenessScore: 0,
                  isFavorite: false,
                  isPublic: false,
                  version: 1,
                  likeCount: 0,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
                ...state.rewriteHistory,
              ],
              currentPrompt: {
                id: `temp-${Date.now()}`,
                title: 'Rewrite Result',
                basePrompt: formState.basePrompt,
                refinedPrompt: response.refinedPrompt,
                genre: formState.genre,
                mood: formState.mood,
                tempo: formState.tempo ? parseInt(formState.tempo) : undefined,
                instrumentation: formState.instrumentation,
                style: formState.style,
                optimizationLevel: formState.optimizationLevel,
                targetPlatforms: formState.targetPlatforms,
                tags: formState.tags,
                effectivenessScore: 0,
                isFavorite: false,
                isPublic: false,
                version: 1,
                likeCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              isRewriting: false,
            }));
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to rewrite prompt',
            isRewriting: false,
          });
        }
      },
      
      saveRewrite: async (title: string, collectionId?: string) => {
        try {
          const { currentPrompt } = get();
          if (!currentPrompt) return;
          
          await get().createPrompt({
            title,
            collectionId,
          });
          
          // Reset form
          get().resetForm();
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to save rewrite',
          });
        }
      },
      
      // Collection actions
      fetchCollections: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // This would be implemented with a real API call
          // For now, return empty array
          set({
            collections: [],
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch collections',
            isLoading: false,
          });
        }
      },
      
      createCollection: async (collectionData) => {
        try {
          set({ isLoading: true, error: null });
          
          // This would be implemented with a real API call
          const newCollection = {
            id: `temp-${Date.now()}`,
            name: collectionData.name,
            description: collectionData.description || '',
            isPublic: collectionData.isPublic || false,
            promptCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set((state) => ({
            collections: [...state.collections, newCollection],
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to create collection',
            isLoading: false,
          });
        }
      },
      
      updateCollection: async (id: string, updates) => {
        try {
          set({ isLoading: true, error: null });
          
          // This would be implemented with a real API call
          set((state) => ({
            collections: state.collections.map(c => 
              c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update collection',
            isLoading: false,
          });
        }
      },
      
      deleteCollection: async (id: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // This would be implemented with a real API call
          set((state) => ({
            collections: state.collections.filter(c => c.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete collection',
            isLoading: false,
          });
        }
      },
      
      // Template actions
      fetchTemplates: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // This would be implemented with a real API call
          // For now, return some default templates
          const defaultTemplates: PromptTemplate[] = [
            {
              id: '1',
              name: 'Epic Cinematic',
              description: 'Perfect for movie trailers and dramatic scenes',
              genre: 'Electronic',
              mood: 'Energetic',
              templateStructure: {
                sections: ['intro', 'build', 'drop', 'breakdown', 'outro'],
                instruments: ['strings', 'piano', 'drums', 'synth'],
                tempo: '120-140',
              },
            },
            {
              id: '2',
              name: 'Chill Lo-Fi',
              description: 'Relaxed beats perfect for studying and relaxing',
              genre: 'Lo-fi',
              mood: 'Calm',
              templateStructure: {
                sections: ['intro', 'verse', 'chorus', 'outro'],
                instruments: ['piano', 'guitar', 'drums', 'bass'],
                tempo: '80-100',
              },
            },
            {
              id: '3',
              name: 'Dance Floor',
              description: 'High-energy beats for clubs and parties',
              genre: 'Electronic',
              mood: 'Energetic',
              templateStructure: {
                sections: ['intro', 'build', 'drop', 'breakdown', 'drop', 'outro'],
                instruments: ['synth', 'bass', 'drums', 'vocals'],
                tempo: '120-130',
              },
            },
          ];
          
          set({
            templates: defaultTemplates,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch templates',
            isLoading: false,
          });
        }
      },
      
      useTemplate: (template) => {
        get().updateFormState({
          genre: template.genre,
          mood: template.mood,
          instrumentation: template.templateStructure.instruments || [],
          tempo: template.templateStructure.tempo || '',
          style: template.name,
        });
      },
      
      // Analytics actions
      fetchAnalytics: async (promptId: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // This would be implemented with a real API call
          const prompt = get().prompts.find(p => p.id === promptId);
          if (prompt) {
            set((state) => ({
              prompts: state.prompts.map(p => 
                p.id === promptId 
                  ? { ...p, analytics: [] } // Placeholder for real analytics
                  : p
              ),
              isLoading: false,
            }));
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch analytics',
            isLoading: false,
          });
        }
      },
      
      addAnalytics: async (promptId: string, analytics) => {
        try {
          // This would be implemented with a real API call
          set((state) => ({
            prompts: state.prompts.map(p => 
              p.id === promptId 
                ? { 
                    ...p, 
                    analytics: [...(p.analytics || []), { 
                      id: `temp-${Date.now()}`, 
                      ...analytics, 
                      createdAt: new Date().toISOString() 
                    } as PromptAnalytics]
                  }
                : p
            ),
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to add analytics',
          });
        }
      },
      
      // Export actions
      exportPrompt: async (id: string, platform: string, format = 'text') => {
        try {
          const response = await get().apiCall(`/prompts/${id}/export`, {
            method: 'POST',
            body: JSON.stringify({ platform, format }),
          });
          
          if (response.success) {
            return response.exportedContent;
          }
          throw new Error('Export failed');
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to export prompt',
          });
          throw error;
        }
      },
      
      // UI actions
      setActiveTab: (activeTab) => {
        set((state) => ({
          uiState: { ...state.uiState, activeTab }
        }));
      },
      
      setSelectedPrompt: (selectedPrompt) => {
        set((state) => ({
          uiState: { ...state.uiState, selectedPrompt }
        }));
      },
      
      setSelectedCollection: (selectedCollection) => {
        set((state) => ({
          uiState: { ...state.uiState, selectedCollection }
        }));
      },
      
      setSearchQuery: (searchQuery) => {
        set((state) => ({
          uiState: { ...state.uiState, searchQuery }
        }));
      },
      
      setSortBy: (sortBy) => {
        set((state) => ({
          uiState: { ...state.uiState, sortBy }
        }));
      },
      
      setSortOrder: (sortOrder) => {
        set((state) => ({
          uiState: { ...state.uiState, sortOrder }
        }));
      },
      
      setFilter: (filter, value) => {
        set((state) => ({
          uiState: {
            ...state.uiState,
            filters: { ...state.uiState.filters, [filter]: value }
          }
        }));
      },
      
      clearFilters: () => {
        set({
          uiState: {
            ...get().uiState,
            filters: { ...defaultUIState.filters }
          }
        });
      },
      
      // Error handling
      setError: (error) => {
        set({ error });
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      // Loading state
      setLoading: (loading) => {
        set({ isLoading: loading });
      },
      
      setRewriting: (rewriting) => {
        set({ isRewriting: rewriting });
      },
    }),
    {
      name: 'retrowave-prompt-storage',
      partialize: (state) => ({
        prompts: state.prompts,
        collections: state.collections,
        templates: state.templates,
        formState: state.formState,
        uiState: state.uiState,
      }),
    }
  )
);