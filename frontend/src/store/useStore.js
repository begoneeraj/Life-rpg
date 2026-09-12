import { create } from 'zustand';
import toast from 'react-hot-toast';
import * as authApi from '../api/auth';
import * as questsApi from '../api/quests';
import * as shopApi from '../api/shop';
import { setOnAuthExpired } from '../api/axios';

const useStore = create((set, get) => ({
  // --- auth/session ---
  user: null,
  character: null,
  authStatus: 'loading', // 'loading' | 'authed' | 'guest'

  // --- quests ---
  quests: [],
  questsStatus: 'idle', // 'idle' | 'loading' | 'ready' | 'error'

  // --- shop ---
  shopItems: [],
  shopStatus: 'idle',

  // --- level-up celebration ---
  levelUpInfo: null, // { fromLevel, toLevel } | null

  // ---------------------------------------------------------------------
  // Auth
  // ---------------------------------------------------------------------
  async bootstrap() {
    try {
      const { data } = await authApi.fetchMe();
      set({ user: data.user, character: data.character, authStatus: 'authed' });
    } catch {
      set({ authStatus: 'guest' });
    }
  },

  async signup(email, password) {
    const { data } = await authApi.signup(email, password);
    set({ user: data.user, character: data.character, authStatus: 'authed' });
  },

  async login(email, password) {
    const { data } = await authApi.login(email, password);
    set({ user: data.user, character: data.character, authStatus: 'authed' });
  },

  async logout() {
    try {
      await authApi.logout();
    } finally {
      set({
        user: null,
        character: null,
        authStatus: 'guest',
        quests: [],
        shopItems: [],
        questsStatus: 'idle',
        shopStatus: 'idle',
      });
    }
  },

  // ---------------------------------------------------------------------
  // Quests
  // ---------------------------------------------------------------------
  async loadQuests() {
    set({ questsStatus: 'loading' });
    try {
      const { data } = await questsApi.fetchQuests();
      set({ quests: data.quests, questsStatus: 'ready' });
    } catch {
      set({ questsStatus: 'error' });
    }
  },

  async addQuest(title, category, difficulty) {
    const { data } = await questsApi.createQuest(title, category, difficulty);
    set((state) => ({ quests: [data.quest, ...state.quests] }));
  },

  /**
   * Optimistic complete: mark the quest completed in the UI immediately,
   * then confirm with the server. On failure, roll the quest back to
   * pending and surface an error toast so the user can retry.
   */
  async completeQuest(id) {
    const previousQuests = get().quests;
    set((state) => ({
      quests: state.quests.map((q) =>
        q.id === id ? { ...q, status: 'completed', _optimistic: true } : q
      ),
    }));

    try {
      const { data } = await questsApi.completeQuest(id);
      set((state) => ({
        quests: state.quests.map((q) => (q.id === id ? { ...data.quest, _optimistic: false } : q)),
        character: data.character,
      }));

      toast.success(`+${data.xpGained} XP · +${data.goldGained} Gold`, { icon: '⚔️' });

      if (data.leveledUp) {
        set({
          levelUpInfo: {
            fromLevel: data.newLevel - data.levelsGained,
            toLevel: data.newLevel,
          },
        });
      }
      return data;
    } catch (err) {
      set({ quests: previousQuests });
      const message = err.response?.data?.error || 'Could not complete quest. Try again.';
      toast.error(message);
      throw err;
    }
  },

  async removeQuest(id) {
    const previousQuests = get().quests;
    set((state) => ({ quests: state.quests.filter((q) => q.id !== id) }));
    try {
      await questsApi.deleteQuest(id);
    } catch {
      set({ quests: previousQuests });
      toast.error('Could not delete quest. Try again.');
    }
  },

  clearLevelUp() {
    set({ levelUpInfo: null });
  },

  // ---------------------------------------------------------------------
  // Shop
  // ---------------------------------------------------------------------
  async loadShopItems() {
    set({ shopStatus: 'loading' });
    try {
      const { data } = await shopApi.fetchShopItems();
      set({ shopItems: data.items, shopStatus: 'ready' });
    } catch {
      set({ shopStatus: 'error' });
    }
  },

  async buyItem(itemId) {
    const { data } = await shopApi.buyShopItem(itemId);
    set({ character: data.character });
    toast.success(`Purchased ${data.purchased.name}!`, { icon: '🛍️' });
  },
}));

// Wire the axios silent-refresh failure path back into the store so an
// expired session bounces the user to /login without a hard reload.
setOnAuthExpired(() => {
  useStore.setState({ user: null, character: null, authStatus: 'guest' });
});

export default useStore;
