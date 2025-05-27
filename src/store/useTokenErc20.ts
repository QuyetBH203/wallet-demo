import { create } from 'zustand'

interface TokenState {
  isLoading: boolean
  error: string | null
  refetch: boolean
  refreshData: () => void
}

export const useTokenStore = create<TokenState>((set) => ({
  data: null,
  isLoading: false,
  error: null,
  refetch: false,
  refreshData: () => {
    set((state) => ({ refetch: !state.refetch }))
  }
}))
