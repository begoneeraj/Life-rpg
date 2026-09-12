import { create } from 'zustand';
import toast from 'react-hot-toast';
import * as authApi from '../api/auth';
import * as questsApi from '../api/quests';
import * as shopApi from '../api/shop';
import * as characterApi from '../api/character';
import * as inventoryApi from '../api/inventory';
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
  shopCategory: 'all',

  // --- inventory ---
  inventoryItems: [],
  inventoryStatus: 'idle',

  // --- level-up celebration ---
  levelUpInfo: null, // { fromLevel, toLevel } | null

  // ---------------------------------------------------------------------
  // Auth
  // ---------------------------------------------------------------------
  async bootstrap() {
    try {
      const { data } = await authApi.fetchMe();
      set({ user: data.user, character: data.character, authStatus: 'authed' });
      await get().loadCharacter();
    } catch {
      set({ authStatus: 'guest' });
    }
  },

  async signup(email, password) {
    const { data } = await authApi.signup(email, password);
    set({ user: data.user, character: data.character, authStatus: 'authed' });
    await get().loadCharacter();
  },

  async login(email, password) {
    const { data } = await authApi.login(email, password);
    set({ user: data.user, character: data.character, authStatus: 'authed' });
    await get().loadCharacter();
  },

  // ---------------------------------------------------------------------
  // Character
  // ---------------------------------------------------------------------
  /**
   * Refetches the full character (appearance + equipped items + inventory)
   * from the server - the only source of truth (never localStorage). Called
   * after every action that can change appearance/equipment/inventory.
   */
  async loadCharacter() {
    try {
      const { data } = await characterApi.fetchCharacter();
      set({ character: data.character });
    } catch {
      // keep whatever character state we already have (e.g. from auth response)
    }
  },

  async createCharacter(appearance) {
    const { data } = await characterApi.createCharacter(appearance);
    set({ character: data.character });
    await get().loadCharacter();
  },

  async updateGarmentColors(slot, primaryColor, accentColor) {
    await characterApi.updateGarmentColors(slot, primaryColor, accentColor);
    await get().loadCharacter();
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
        inventoryItems: [],
        questsStatus: 'idle',
        shopStatus: 'idle',
        inventoryStatus: 'idle',
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
      }));
      // The quest-completion response's `character` is unshaped (no
      // resolved equippedItems/inventory) - refetch through loadCharacter()
      // so the avatar/equipment stay in the shape CharacterAvatar expects.
      await get().loadCharacter();

      const attributeLabel = data.attribute
        ? data.attribute.charAt(0).toUpperCase() + data.attribute.slice(1)
        : null;
      toast.success(
        `+${data.xpGained} XP · +${data.goldGained} Gold${attributeLabel ? ` · +${data.xpGained} ${attributeLabel}` : ''}`,
        { icon: '⚔️' }
      );

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
  async loadShopItems(category) {
    const cat = category ?? get().shopCategory;
    set({ shopStatus: 'loading', shopCategory: cat });
    try {
      const { data } = await shopApi.fetchShopItems(cat === 'all' ? undefined : cat);
      set({ shopItems: data.items, shopStatus: 'ready' });
    } catch {
      set({ shopStatus: 'error' });
    }
  },

  async buyItem(itemId) {
    const { data } = await shopApi.buyShopItem(itemId);
    toast.success(`ITEM ACQUIRED: ${data.purchased.name} added to your inventory.`, { icon: '🛍️' });
    await Promise.all([get().loadCharacter(), get().loadShopItems()]);
  },

  // ---------------------------------------------------------------------
  // Inventory
  // ---------------------------------------------------------------------
  async loadInventory() {
    set({ inventoryStatus: 'loading' });
    try {
      const { data } = await inventoryApi.fetchInventory();
      set({ inventoryItems: data.items, inventoryStatus: 'ready' });
    } catch {
      set({ inventoryStatus: 'error' });
    }
  },

  async equipItem(itemId) {
    await inventoryApi.equipItem(itemId);
    await Promise.all([get().loadCharacter(), get().loadInventory()]);
  },

  async unequipItem(itemId) {
    await inventoryApi.unequipItem(itemId);
    await Promise.all([get().loadCharacter(), get().loadInventory()]);
  },
}));

// Wire the axios silent-refresh failure path back into the store so an
// expired session bounces the user to /login without a hard reload.
setOnAuthExpired(() => {
  useStore.setState({ user: null, character: null, authStatus: 'guest' });
});

export default useStore;
