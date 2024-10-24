const axios = require('axios');

const fetchDishes = async () => {
  const pantryItems = [
    "Apple", "Banana", "Carrot", "Strawberry", "White Rice", "Sourdough Bread", "Beef", "Egg", "Milk", "Cheese",
    "Chicken", "Tomato", "Lettuce", "Potato", "Pasta", "Broccoli", "Spinach", "Onion", "Garlic", "Peanut Butter"
  ];

  const messages = [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: `Suggest 6 dishes using the following ingredients: ${pantryItems.join(', ')}. For each dish, provide a name, preparation time, difficulty level, and an image URL. Format the response as a JSON array.` }
  ];

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      messages: messages,
      max_tokens: 500,
      n: 1,
      stop: null,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer sk-proj-ORiIOEdVFBSphq5PLbsMT3BlbkFJBAwHNUi501nuSXJ68xtJ`,
        'Content-Type': 'application/json'
      }
    });

    console.log('OpenAI API response:', response.data);

    const choices = response.data.choices[0].message.content.trim();
    console.log('Response Text:', choices);

    let suggestedDishes;
    try {
      suggestedDishes = JSON.parse(choices);
      console.log('Suggested Dishes:', suggestedDishes);
    } catch (jsonError) {
      console.error('JSON Parse Error:', jsonError);
    }
  } catch (apiError) {
    console.error('Error fetching dishes:', apiError.response ? apiError.response.data : apiError.message);
  }
};

fetchDishes();
