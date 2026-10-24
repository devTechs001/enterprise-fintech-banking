import axiosInstance from './axiosInstance';

/**
 * Card service for card-related API calls
 */
export const cardService = {
  /**
   * Get cards
   * @param {Object} params - Query params
   * @returns {Promise} Cards response
   */
  getCards: async (params = {}) => {
    return axiosInstance.get('/cards', { params });
  },

  /**
   * Get a single card by id
   * @param {string} cardId - Card id
   * @returns {Promise} Card response
   */
  getCardById: async (cardId) => {
    return axiosInstance.get(`/cards/${cardId}`);
  },

  /**
   * Create a new card (virtual or physical)
   * @param {Object} data - Card data
   * @returns {Promise} Created card response
   */
  createCard: async (data) => {
    return axiosInstance.post('/cards', data);
  },

  /**
   * Update a card (e.g. freeze/unfreeze, limits)
   * @param {string} cardId - Card id
   * @param {Object} data - Card update data
   * @returns {Promise} Updated card response
   */
  updateCard: async (cardId, data) => {
    return axiosInstance.patch(`/cards/${cardId}`, data);
  },
};

export default cardService;
