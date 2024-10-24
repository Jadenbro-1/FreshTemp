import axios from 'axios';

const SPOONACULAR_API_KEY = 'd5fb437b7f08412cbd659f8db0f01c94';

export const getFoodImage = async (foodName) => {
  try {
    const response = await axios.get(`https://api.spoonacular.com/food/ingredients/search`, {
      params: {
        query: foodName,
        apiKey: SPOONACULAR_API_KEY,
      },
    });
    if (response.data.results && response.data.results.length > 0) {
      return `https://spoonacular.com/cdn/ingredients_100x100/${response.data.results[0].image}`;
    }
    return null;
  } catch (error) {
    console.error('Error fetching food image:', error);
    return null;
  }
};
