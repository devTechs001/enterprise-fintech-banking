import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cards: [],
  primaryCard: null,
  isLoading: false,
  error: null,
};

const cardSlice = createSlice({
  name: 'cards',
  initialState,
  reducers: {
    setCards: (state, action) => {
      state.cards = action.payload;
      state.primaryCard = action.payload.find((c) => c.isPrimary) || action.payload[0];
    },
    addCard: (state, action) => {
      state.cards.push(action.payload);
    },
    updateCard: (state, action) => {
      const index = state.cards.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.cards[index] = { ...state.cards[index], ...action.payload };
      }
    },
    removeCard: (state, action) => {
      state.cards = state.cards.filter((c) => c.id !== action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setCards, addCard, updateCard, removeCard, clearError } = cardSlice.actions;
export const selectCards = (state) => state.cards.cards;
export const selectPrimaryCard = (state) => state.cards.primaryCard;

export default cardSlice.reducer;
