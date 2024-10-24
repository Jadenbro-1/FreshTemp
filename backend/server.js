const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;
const app = express();
const port = process.env.PORT || 3000; // Use process.env.PORT for Heroku

// Add these imports
const OpenAI = require('openai');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const fs = require('fs');
require('dotenv').config(); // To load environment variables from .env file

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure this environment variable is set
});

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// PostgreSQL connection setup
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(cors());
app.use(express.json());

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create Users table
const createUsersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(100) NOT NULL,
      phone VARCHAR(20),
      state VARCHAR(50),
      city VARCHAR(50)
    );
  `;
  try {
    await pool.query(query);
    console.log('Users table created successfully');
  } catch (error) {
    console.error('Error creating Users table:', error.message);
  }
};

createUsersTable();

// Register a new user
app.post('/api/register', async (req, res) => {
  const { first_name, last_name, email, password, phone, state, city } = req.body;

  try {
    console.log('Received registration request for email:', email);
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');
    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, phone, state, city) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [first_name, last_name, email, hashedPassword, phone, state, city]
    );
    console.log('User registered successfully:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error during registration:', error.message);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'An error occurred during registration' });
    }
  }
});

// Login a user
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred during login' });
  }
});

// Endpoint to fetch all recipes
app.get('/api/recipes', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM recipes');
    const recipes = result.rows;
    client.release();
    res.json(recipes);
  } catch (err) {
    console.error('Error fetching recipes:', err);
    res.status(500).json({ error: 'Error fetching recipes' });
  }
});

// New endpoint to fetch recipes by category
app.get('/api/recipes/category', async (req, res) => {
  const { category } = req.query;
  try {
    const client = await pool.connect();
    const query = 'SELECT * FROM recipes WHERE category ILIKE $1';
    const result = await client.query(query, [`%${category}%`]);
    const recipes = result.rows;
    client.release();
    res.json(recipes);
  } catch (err) {
    console.error('Error fetching recipes by category:', err);
    res.status(500).json({ error: 'Error fetching recipes by category' });
  }
});

// Recipe ID for recipe details
app.get('/api/recipe/:id', async (req, res) => {
  const recipeId = req.params.id;
  const userId = req.query.userId; // Assume userId is passed as a query parameter

  try {
    const client = await pool.connect();

    // Fetch the recipe details
    const recipeResult = await client.query('SELECT * FROM recipes WHERE id = $1', [recipeId]);
    const recipe = recipeResult.rows[0];

    if (!recipe) {
      client.release();
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Fetch the user's pantry items
    const pantryResult = await client.query('SELECT * FROM pantry WHERE user_id = $1', [userId]);
    const pantryItems = pantryResult.rows;

    // Fetch the recipe ingredients
    const ingredientsResult = await client.query(
      `SELECT i.name
       FROM ingredients i
       JOIN recipe_ingredients ri ON i.id = ri.ingredient_id
       WHERE ri.recipe_id = $1`,
      [recipeId]
    );
    const recipeIngredients = ingredientsResult.rows;

    // Use similar logic to the AI menu query to check for ingredient availability
    const ingredientStatus = recipeIngredients.map(ingredient => {
      const inStock = pantryItems.some(pantryItem => 
        ingredient.name.toLowerCase().includes(pantryItem.name.toLowerCase())
      );
      return {
        name: ingredient.name,
        inStock: inStock
      };
    });

    client.release();
    res.json({ recipe, ingredientStatus });
  } catch (err) {
    console.error('Error fetching recipe details:', err);
    res.status(500).json({ error: 'Error fetching recipe details', details: err.message });
  }
});


app.get('/api/ai-menu', async (req, res) => {
  const commonIngredients = ['salt', 'pepper', 'water', 'oil'];

  const query = `
    WITH user_pantry AS (
        SELECT * FROM pantry
    ), pantry_ingredients AS (
        SELECT i.id, i.name
        FROM ingredients i
        JOIN user_pantry p ON LOWER(i.name) LIKE '%' || LOWER(p.name) || '%'
        UNION
        SELECT id, name
        FROM ingredients
        WHERE LOWER(name) = ANY(ARRAY[${commonIngredients.map(ci => `'${ci}'`).join(',')}])
    ), recipe_ingredient_count AS (
        SELECT r.id AS recipe_id, COUNT(DISTINCT ri.ingredient_id) AS total_ingredients
        FROM recipes r
        JOIN recipe_ingredients ri ON r.id = ri.recipe_id
        GROUP BY r.id
    ), matched_ingredient_count AS (
        SELECT r.id AS recipe_id, COUNT(DISTINCT ri.ingredient_id) AS matched_ingredients
        FROM recipes r
        JOIN recipe_ingredients ri ON r.id = ri.recipe_id
        JOIN pantry_ingredients pi ON ri.ingredient_id = pi.id
        GROUP BY r.id
    )
    SELECT r.*, n.calories, n."proteinContent", n."carbohydrateContent", n."fatContent"
    FROM recipes r
    JOIN recipe_ingredient_count ric ON r.id = ric.recipe_id
    JOIN matched_ingredient_count mic ON r.id = mic.recipe_id
    JOIN nutrients n ON r.id = n.recipe_id  -- Make sure nutrients table is joined here
    WHERE ric.total_ingredients = mic.matched_ingredients;
  `;

  try {
    const client = await pool.connect();
    const result = await client.query(query);
    const recipes = result.rows;
    client.release();
    res.json(recipes);
  } catch (err) {
    console.error('Error fetching AI Menu recipes:', err);
    res.status(500).json({ error: 'Error fetching AI Menu recipes', details: err.message });
  }
});

// Endpoint to fetch user details by ID
app.get('/api/user/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      client.release();
      return;
    }

    client.release();
    res.json(user);
  } catch (err) {
    console.error('Error fetching user details:', err);
    res.status(500).json({ error: 'Error fetching user details', details: err.message });
  }
});

// Endpoint to fetch nutritional information for a recipe
app.get('/api/nutrients/:id', async (req, res) => {
  const recipeId = req.params.id;
  try {
    const client = await pool.connect();
    const nutrientsResult = await client.query('SELECT * FROM nutrients WHERE recipe_id = $1', [recipeId]);
    const nutrients = nutrientsResult.rows;

    if (nutrients.length === 0) {
      res.status(404).json({ error: 'Nutritional information not found for this recipe' });
      client.release();
      return;
    }

    client.release();
    res.json(nutrients[0]); // Assuming there's only one set of nutrients per recipe for simplicity
  } catch (err) {
    console.error('Error fetching nutritional information:', err);
    res.status(500).json({ error: 'Error fetching nutritional information', details: err.message });
  }
});

// Endpoint to fetch media details
app.get('/api/media', async (req, res) => {
  try {
    const client = await pool.connect();
    console.log("Database connected successfully");
    const result = await client.query(`
      SELECT 
        m.media_id, 
        m.public_id, 
        m.url, 
        m.type, 
        m.uploaded_at, 
        m.recipe_id, 
        m.author_id,
        u.first_name AS author_first_name, 
        u.last_name AS author_last_name,
        r.description AS recipe_description
      FROM media m
      JOIN users u ON m.author_id = u.id
      JOIN recipes r ON m.recipe_id = r.id
    `);
    console.log("Query executed successfully");
    const media = result.rows.map(row => ({
      ...row,
      url: cloudinary.url(row.public_id, { resource_type: "video" })
    }));
    client.release();
    res.json(media);
  } catch (err) {
    console.error('Error fetching media:', err.message, err.stack);
    res.status(500).json({ error: 'Error fetching media', details: err.message });
  }
});

// Endpoint to upload a recipe and media
app.post('/api/upload', async (req, res) => {
  const {
    title,
    description,
    prep_time,
    cook_time,
    ingredients,
    instructions, // Instructions as part of the recipes table
    category,
    cuisine,
    tags,
    videoUri,
    imageUri,
    userId // Use userId instead of username
  } = req.body;

  console.log('Received upload request with userId:', userId);
  
  const total_time = parseFloat(prep_time) + parseFloat(cook_time);

  const client = await pool.connect();

  try {
    await client.query('BEGIN'); // Start transaction

    // Get user ID directly from the request body
    console.log('Fetching user ID:', userId);
    const userResult = await client.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      console.error('User not found for ID:', userId);
      throw new Error('User not found');
    }
    const fetchedUserId = userResult.rows[0].id;
    console.log('Found user ID:', fetchedUserId);

    // Upload video to Cloudinary
    const videoResult = await cloudinary.uploader.upload(videoUri, {
      resource_type: "video",
      folder: "videos",
      format: "mp4",
      transformation: [
        { aspect_ratio: "9:16", crop: "fill" },
        { quality: "auto" },
        { width: 1080, height: 1920 }
      ],
      eager: [
        { width: 300, height: 500, crop: "pad", audio_codec: "none" }
      ],
      eager_async: true,
      eager_notification_url: "https://mysite.example.com/notify_endpoint"
    });

    const videoMetadata = {
      media_id: videoResult.asset_id,
      public_id: videoResult.public_id,
      url: videoResult.secure_url,
      type: videoResult.resource_type,
      uploaded_at: videoResult.created_at,
    };

    // Upload image to Cloudinary
    const imageResult = await cloudinary.uploader.upload(imageUri, {
      folder: "images",
      format: "jpg",
      transformation: [{ quality: "auto" }],
    });

    const imageMetadata = {
      url: imageResult.secure_url,
      public_id: imageResult.public_id,
    };

    // Insert recipe data into the database
    const recipeResult = await client.query(
      `INSERT INTO recipes (author, title, description, instructions, category, total_time, cook_time, prep_time, cuisine, image, ingredients, tags) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
      [fetchedUserId, title, description, instructions.join('\n'), category, total_time, cook_time, prep_time, cuisine, imageMetadata.url, ingredients.join('\n'), tags]
    );

    const recipeId = recipeResult.rows[0].id;

    // Insert media metadata into the database
    await client.query(
      `INSERT INTO media (media_id, public_id, url, type, uploaded_at, recipe_id, author_id) 
       VALUES ($1, $2, $3, 'video', NOW(), $4, $5)`,
      [videoMetadata.media_id, videoMetadata.public_id, videoMetadata.url, recipeId, fetchedUserId]
    );

    await client.query('COMMIT'); // Commit transaction
    res.status(201).json({ message: 'Recipe and media uploaded successfully' });
  } catch (err) {
    await client.query('ROLLBACK'); // Rollback transaction
    console.error('Error uploading recipe and media:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  } finally {
    client.release();
  }
});

// Endpoint to fetch pantry items for a user
app.get('/api/pantry/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const result = await pool.query('SELECT * FROM pantry WHERE user_id = $1', [userId]);
    const pantryItems = result.rows;

    if (!pantryItems.length) {
      return res.status(404).json({ error: 'No pantry items found for this user' });
    }

    res.status(200).json(pantryItems);
  } catch (error) {
    console.error('Error fetching pantry items:', error);
    res.status(500).json({ error: 'An error occurred while fetching pantry items' });
  }
});

// Endpoint to add items to the pantry
app.post('/api/pantry', async (req, res) => {
  const { userId, name, quantity, expirationDate, type } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO pantry (user_id, name, quantity, expiration_date, type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, name, quantity, expirationDate, type]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding item to pantry:', error);
    res.status(500).json({ error: 'An error occurred while adding item to pantry' });
  }
});

// Add to server.js

// Endpoint to add a recipe to favorites
app.post('/api/favorites', async (req, res) => {
  const { userId, recipeId } = req.body;

  try {
    const client = await pool.connect();
    await client.query(
      'INSERT INTO favorites (user_id, recipe_id) VALUES ($1, $2)',
      [userId, recipeId]
    );
    client.release();
    res.status(201).json({ message: 'Recipe added to favorites' });
  } catch (err) {
    console.error('Error adding favorite:', err);
    res.status(500).json({ error: 'Error adding favorite', details: err.message });
  }
});

// Endpoint to remove a recipe from favorites
app.delete('/api/favorites', async (req, res) => {
  const { userId, recipeId } = req.body;

  try {
    const client = await pool.connect();
    await client.query(
      'DELETE FROM favorites WHERE user_id = $1 AND recipe_id = $2',
      [userId, recipeId]
    );
    client.release();
    res.status(200).json({ message: 'Recipe removed from favorites' });
  } catch (err) {
    console.error('Error removing favorite:', err);
    res.status(500).json({ error: 'Error removing favorite', details: err.message });
  }
});

// Endpoint to fetch favorite recipes
app.get('/api/favorites/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT r.* FROM recipes r JOIN favorites f ON r.id = f.recipe_id WHERE f.user_id = $1',
      [userId]
    );
    const recipes = result.rows;
    client.release();
    res.json(recipes);
  } catch (err) {
    console.error('Error fetching favorite recipes:', err);
    res.status(500).json({ error: 'Error fetching favorite recipes', details: err.message });
  }
});
// Endpoint to save customization
app.post('/api/customizations', async (req, res) => {
  const { userId, name, calories, protein, carbs, fats } = req.body;

  console.log('Received customization data:', { userId, name, calories, protein, carbs, fats });

  try {
    const result = await pool.query(
      `INSERT INTO customizations (user_id, name, calories, protein, carbs, fats) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, name, calories, protein, carbs, fats]
    );

    console.log('Customization saved:', result.rows[0]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error saving customization:', error.message);
    res.status(500).json({ error: 'An error occurred while saving the customization' });
  }
});


// Endpoint to fetch all customizations for a user
app.get('/api/customizations/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const result = await pool.query('SELECT * FROM customizations WHERE user_id = $1', [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching customizations:', error);
    res.status(500).json({ error: 'An error occurred while fetching the customizations' });
  }
});

// Endpoint to delete a customization
app.delete('/api/customizations/:id', async (req, res) => {
  const id = req.params.id;

  try {
    await pool.query('DELETE FROM customizations WHERE id = $1', [id]);
    res.status(200).json({ message: 'Customization deleted successfully' });
  } catch (error) {
    console.error('Error deleting customization:', error);
    res.status(500).json({ error: 'An error occurred while deleting the customization' });
  }
});
// Endpoint to fetch all customizations for a user
app.get('/api/customizations/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const result = await pool.query('SELECT * FROM customizations WHERE user_id = $1', [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching customizations:', error);
    res.status(500).json({ error: 'An error occurred while fetching the customizations' });
  }
});
/// Endpoint to fetch recipes based on customization
app.get('/api/recipes/customization/:customizationId', async (req, res) => {
  const { customizationId } = req.params;

  try {
    // Fetch the customization details
    const customizationResult = await pool.query('SELECT * FROM customizations WHERE id = $1', [customizationId]);
    const customization = customizationResult.rows[0];

    if (!customization) {
      return res.status(404).json({ error: 'Customization not found' });
    }

    const targetCalories = customization.calories;
    const targetProtein = customization.protein;
    const targetCarbs = customization.carbs;
    const targetFats = customization.fats;
    const tolerance = 0.2; // 20% tolerance for nutrient matching

    // Fetch the recipes that match the nutritional goals
    const query = `
      WITH target AS (
          SELECT
              ${targetCalories} AS target_calories,
              ${targetProtein} AS target_protein,
              ${targetCarbs} AS target_carbs,
              ${targetFats} AS target_fats
      ),
      nutrient_ranges AS (
          SELECT
              target_calories,
              target_protein,
              target_carbs,
              target_fats,
              target_calories * (1 - ${tolerance}) AS min_calories,
              target_calories * (1 + ${tolerance}) AS max_calories,
              target_protein * (1 - ${tolerance}) AS min_protein,
              target_protein * (1 + ${tolerance}) AS max_protein,
              target_carbs * (1 - ${tolerance}) AS min_carbs,
              target_carbs * (1 + ${tolerance}) AS max_carbs,
              target_fats * (1 - ${tolerance}) AS min_fats,
              target_fats * (1 + ${tolerance}) AS max_fats
          FROM
              target
      ),
      filtered_recipes AS (
          SELECT
SELECT
    r.id,
    r.title,
    r.image,
    r.category,
              CAST(REGEXP_REPLACE(n.calories, '[^0-9.]', '', 'g') AS DOUBLE PRECISION) AS calories,
              CAST(REGEXP_REPLACE(n."proteinContent", '[^0-9.]', '', 'g') AS DOUBLE PRECISION) AS "proteinContent",
              CAST(REGEXP_REPLACE(n."carbohydrateContent", '[^0-9.]', '', 'g') AS DOUBLE PRECISION) AS "carbohydrateContent",
              CAST(REGEXP_REPLACE(n."fatContent", '[^0-9.]', '', 'g') AS DOUBLE PRECISION) AS "fatContent"
          FROM
              nutrients n
          JOIN
              recipes r ON n.recipe_id = r.id
          CROSS JOIN
              nutrient_ranges nr
          WHERE
              CAST(REGEXP_REPLACE(n.calories, '[^0-9.]', '', 'g') AS DOUBLE PRECISION) BETWEEN nr.min_calories AND nr.max_calories AND
              CAST(REGEXP_REPLACE(n."proteinContent", '[^0-9.]', '', 'g') AS DOUBLE PRECISION) BETWEEN nr.min_protein AND nr.max_protein AND
              CAST(REGEXP_REPLACE(n."carbohydrateContent", '[^0-9.]', '', 'g') AS DOUBLE PRECISION) BETWEEN nr.min_carbs AND nr.max_carbs AND
              CAST(REGEXP_REPLACE(n."fatContent", '[^0-9.]', '', 'g') AS DOUBLE PRECISION) BETWEEN nr.min_fats AND nr.max_fats
      )
SELECT
    id, title, image, category, calories, "proteinContent", "carbohydrateContent", "fatContent"
FROM
    filtered_recipes
      LIMIT 50;
    `;

    const result = await pool.query(query);
    const recipes = result.rows;

    res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes for customization:', error);
    res.status(500).json({ error: 'An error occurred while fetching recipes for customization' });
  }
});
app.post('/api/cart', async (req, res) => {
  const { userId, ingredients } = req.body;

  try {
    const client = await pool.connect();
    const insertPromises = ingredients.map(async (ingredient) => {
      await client.query(
        'INSERT INTO cart (user_id, ingredient) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [userId, ingredient]
      );
    });

    await Promise.all(insertPromises);

    // Remove duplicate ingredients based on similar names
    const { rows: cartItems } = await client.query('SELECT id, ingredient FROM cart WHERE user_id = $1', [userId]);
    const seen = new Map();

    for (const item of cartItems) {
      const cleanedIngredient = item.ingredient
        .replace(/\d+|\([^)]*\)/g, '')
        .replace(/\b(onion|garlic|cloves|chopped|minced|cup|teaspoon|tablespoon|large|medium|extra|small|sprig|leaves|leaf|basil|rosemary|parsley|fresh|dried|water)\b/g, '')
        .trim().toLowerCase();

      if (seen.has(cleanedIngredient)) {
        await client.query('DELETE FROM cart WHERE id = $1', [item.id]);
      } else {
        seen.set(cleanedIngredient, true);
      }
    }

    client.release();
    res.status(201).json({ message: 'Ingredients added to cart successfully' });
  } catch (err) {
    console.error('Error adding ingredients to cart:', err);
    res.status(500).json({ error: 'Error adding ingredients to cart', details: err.message });
  }
});

app.get('/api/cart/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT 
        id,
        user_id,
        ingredient,
        quantity,
        substring(ingredient from '^\d*\s?[^\d\s]+\s*') as extracted_quantity,
        trim(leading substring(ingredient from '^\d*\s?[^\d\s]+\s*') from ingredient) as extracted_ingredient
      FROM cart
      WHERE user_id = $1
    `, [userId]);
    client.release();
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching cart items:', err);
    res.status(500).json({ error: 'Error fetching cart items', details: err.message });
  }
});

// Endpoint to delete a specific item from the cart
app.delete('/api/cart', async (req, res) => {
  const { userId, ingredient } = req.body;

  try {
    const client = await pool.connect();

    // Delete the specific ingredient from the cart for the user
    const result = await client.query(
      'DELETE FROM cart WHERE user_id = $1 AND ingredient = $2', 
      [userId, ingredient]
    );

    client.release();

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    res.status(200).json({ message: 'Item deleted successfully from cart' });
  } catch (err) {
    console.error('Error deleting item from cart:', err);
    res.status(500).json({ error: 'Error deleting item from cart', details: err.message });
  }
});
app.post('/api/saveMealPlan', async (req, res) => {
  const {
    userId,
    weeklyPlan,
    isFavorited,
    savedPlanName,
    tags,
    addToShoppingList,
  } = req.body;

  try {
    // Start transaction
    await pool.query('BEGIN');

    const weekIdentifier = getWeekIdentifier();

    for (const day in weeklyPlan) {
      const dayOfWeek = day;
      const meals = weeklyPlan[day];

      for (const mealType in meals) {
        const meal = meals[mealType];

        if (meal) {
          const { name } = meal;

          // Assuming you have a way to get recipe_id from meal name
          // You might need to adjust this part based on your actual data
          const recipeResult = await pool.query(
            'SELECT id FROM recipes WHERE title = $1 LIMIT 1',
            [name]
          );

          if (recipeResult.rows.length > 0) {
            const recipeId = recipeResult.rows[0].id;

            await pool.query(
              `INSERT INTO meal_planner (user_id, recipe_id, meal_type, day_of_week, week_identifier, saved_plan_name, is_favorited, tags, add_to_shopping_list)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
              [
                userId,
                recipeId,
                mealType,
                dayOfWeek,
                weekIdentifier,
                savedPlanName || null,
                isFavorited || false,
                tags || null,
                addToShoppingList || false,
              ]
            );
          } else {
            // Handle case where recipe is not found
            console.error(`Recipe not found for meal: ${name}`);
          }
        }
      }
    }

    // Commit transaction
    await pool.query('COMMIT');

    res.status(200).json({ message: 'Meal plan saved successfully.' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error saving meal plan:', error.message);
    res.status(500).json({ error: 'Failed to save meal plan.' });
  }
});

// Helper function to get week identifier
function getWeekIdentifier() {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const weekNumber = getWeekNumber(startOfWeek);
  const year = startOfWeek.getFullYear();
  return `${year}-W${weekNumber}`;
}

// Helper function to get week number
function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return weekNo;
}
// Endpoint to get the saved meal plan for a user
app.get('/api/getMealPlan/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const client = await pool.connect();

    const result = await client.query(
      `SELECT mp.*, r.title, r.image, r.calories, r.proteinContent, r.carbohydrateContent, r.fatContent, r.prepTime, r.instructions
       FROM meal_planner mp
       JOIN recipes r ON mp.recipe_id = r.id
       WHERE mp.user_id = $1`,
      [userId]
    );

    const mealPlanRows = result.rows;

    // Transform data into a structured meal plan
    const mealPlan = {};

    mealPlanRows.forEach((row) => {
      const { day_of_week, meal_type, week_identifier, ...mealData } = row;

      if (!mealPlan[day_of_week]) {
        mealPlan[day_of_week] = {
          date: getDateFromWeekIdentifier(week_identifier, day_of_week),
          meals: [],
        };
      }

      mealPlan[day_of_week].meals.push({
        id: mealData.recipe_id,
        title: mealData.title,
        image: mealData.image,
        category: meal_type,
        calories: mealData.calories,
        proteinContent: mealData.proteinContent,
        carbohydrateContent: mealData.carbohydrateContent,
        fatContent: mealData.fatContent,
        prepTime: mealData.prepTime,
        instructions: mealData.instructions,
        earlyPrep: false, // You can adjust this based on your data
      });
    });

    client.release();
    res.json(mealPlan);
  } catch (error) {
    console.error('Error fetching meal plan:', error);
    res.status(500).json({ error: 'Failed to fetch meal plan.' });
  }
});

// Helper function to get date from week identifier and day of week
function getDateFromWeekIdentifier(weekIdentifier, dayOfWeek) {
  const [year, weekStr] = weekIdentifier.split('-W');
  const weekNumber = parseInt(weekStr, 10);

  const firstDayOfYear = new Date(Date.UTC(year, 0, 1));
  const days = (weekNumber - 1) * 7 + daysOfWeekToNumber(dayOfWeek);
  firstDayOfYear.setUTCDate(firstDayOfYear.getUTCDate() + days);

  return firstDayOfYear.toISOString();
}

function daysOfWeekToNumber(day) {
  const days = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };
  return days[day];
}
// Endpoint to update the meal plan
app.put('/api/updateMealPlan', async (req, res) => {
  const {
    userId,
    weeklyPlan,
    isFavorited,
    savedPlanName,
    tags,
    addToShoppingList,
  } = req.body;

  try {
    // Start transaction
    await pool.query('BEGIN');

    const weekIdentifier = getWeekIdentifier();

    // Delete existing meal plan entries for the user for this week
    await pool.query(
      `DELETE FROM meal_planner WHERE user_id = $1 AND week_identifier = $2`,
      [userId, weekIdentifier]
    );

    // Insert the updated meal plan
    for (const day in weeklyPlan) {
      const dayOfWeek = day;
      const meals = weeklyPlan[day];

      for (const mealType in meals) {
        const meal = meals[mealType];

        if (meal) {
          const { name } = meal;

          // Get recipe_id from meal name
          const recipeResult = await pool.query(
            'SELECT id FROM recipes WHERE title = $1 LIMIT 1',
            [name]
          );

          if (recipeResult.rows.length > 0) {
            const recipeId = recipeResult.rows[0].id;

            await pool.query(
              `INSERT INTO meal_planner (user_id, recipe_id, meal_type, day_of_week, week_identifier, saved_plan_name, is_favorited, tags, add_to_shopping_list)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
              [
                userId,
                recipeId,
                mealType,
                dayOfWeek,
                weekIdentifier,
                savedPlanName || null,
                isFavorited || false,
                tags || null,
                addToShoppingList || false,
              ]
            );
          } else {
            console.error(`Recipe not found for meal: ${name}`);
          }
        }
      }
    }

    // Commit transaction
    await pool.query('COMMIT');

    res.status(200).json({ message: 'Meal plan updated successfully.' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error updating meal plan:', error.message);
    res.status(500).json({ error: 'Failed to update meal plan.' });
  }
});

// Endpoint to process receipt
app.post('/api/process-receipt', upload.single('receiptImage'), async (req, res) => {
  try {
    const imagePath = req.file.path;

    // Perform OCR using Tesseract.js
    const {
      data: { text: extractedText },
    } = await Tesseract.recognize(imagePath, 'eng');

    // Remove the uploaded image file asynchronously after processing
    await fs.promises.unlink(imagePath);

    // Get today's date to ensure future expiration dates
    const today = new Date().toISOString().split('T')[0];

    // Prepare the prompt for OpenAI
    const prompt = `Please analyze the following receipt text and extract the item name, quantity with metric, price (if available), and expiration date (if applicable). 

1. If the item can expire, estimate the expiration date based on FDA guidelines, research, or industry best practices for each specific food item (e.g., bread, zucchini, milk). Use specific information on shelf life from trusted sources such as the FDA.
2. Expiration dates should vary based on the actual type of item. For example:
   - **Fresh bread**: typically lasts 5-7 days.
   - **Fresh fruits**: typically last 7-14 days.
   - **Frozen meats**: 6-12 months.
   - **Canned goods**: 1-5 years.
3. For each item, consider factors like refrigeration or storage, and make a reasonable estimate. If no expiration is available or relevant, return 'No Expiration Date'.
4. Ensure the expiration date is always in the future relative to today's date (${today}).
5. Item names should be in title case (capitalize each word appropriately, e.g., 'Whole Wheat Bread' instead of 'WHOLE WHEAT BREAD').
6. If any item cannot be clearly understood from the receipt, mark it as 'Unreadable' and include an alert for the user to retake the picture.
7. Only return the output in valid JSON format, structured like this:

[
  {
    "name": "Item Name",
    "quantity": "Quantity with metric",
    "expiration_date": "YYYY-MM-DD or 'No Expiration Date'",
    "type": "Fruits, Vegetables, Dairy, Grains, Proteins, Spices, Condiments, Baking, Frozen, Canned Goods, Other",
    "readable": true/false,  // If the item is readable or not
    "alert": "Retake picture for clearer text"  // If unreadable, this message will appear
  },
  ...
]

Here is the receipt text:

${extractedText}`;

    // Send the prompt to OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // Specify GPT-4 or the correct model
      messages: [
        { role: 'system', content: 'You are an assistant that processes receipt data and provides expiration dates using FDA research.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 800,
      temperature: 0.2,
    });

    let assistantResponse = completion.choices[0].message.content;

    // Ensure the response is valid JSON
    assistantResponse = assistantResponse.trim();

    // If the response starts or ends with non-JSON, try to clean it up
    const jsonStart = assistantResponse.indexOf('[');
    const jsonEnd = assistantResponse.lastIndexOf(']');
    
    if (jsonStart !== -1 && jsonEnd !== -1) {
      assistantResponse = assistantResponse.substring(jsonStart, jsonEnd + 1);
    }

    // Parse the assistant's response as JSON
    let structuredData;
    try {
      structuredData = JSON.parse(assistantResponse);
    } catch (parseError) {
      console.error('Error parsing assistant response:', parseError);
      return res.status(500).json({ error: 'Error parsing assistant response', assistantResponse });
    }

    // Check if any items were unreadable and need a picture retake
    const unreadableItems = structuredData.filter(item => item.readable === false);

    if (unreadableItems.length > 0) {
      return res.status(400).json({ 
        error: 'Some items were unreadable. Please retake a picture of the receipt.', 
        unreadableItems 
      });
    }

    res.json({ receiptItems: structuredData });
  } catch (error) {
    console.error('Error processing receipt:', error.message);
    res.status(500).json({ error: 'Error processing receipt', details: error.message });
  }
});

// Endpoint to add multiple items to the pantry
app.post('/api/pantry/bulk', async (req, res) => {
  const { items } = req.body;

  const client = await pool.connect(); // Get the client connection
  try {
    // Start transaction
    await client.query('BEGIN');

    for (const item of items) {
      const { name, quantity, expiration_date, type, user_id } = item;

      await client.query(
        'INSERT INTO pantry (name, quantity, expiration_date, type, user_id) VALUES ($1, $2, $3, $4, $5)',
        [name, quantity, expiration_date, type, user_id]
      );
    }

    // Commit transaction
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK'); // Rollback in case of error
    console.error('Error saving pantry items:', error.message);
    res.status(500).json({ error: 'Error saving pantry items', details: error.message });
  } finally {
    client.release(); // Always release the client
  }
});

// Endpoint to process missing ingredients
app.post('/api/process-ingredients', async (req, res) => {
  try {
    const { missingIngredients, userId } = req.body;

    // Prepare the ingredient list as a string to send to GPT
    const ingredientList = missingIngredients.map(item => `${item.amount} ${item.metric} ${item.name}`).join(', ');

    // Prepare the prompt for OpenAI
    const prompt = `You are an assistant that processes grocery lists. Given the following list of ingredients: ${ingredientList}, return a valid JSON array with objects that include the following fields:
    - "item_name": The cleaned-up name of the ingredient.
    - "quantity": The quantity of the ingredient.
    - "metric": The unit of measure for the ingredient.
    - "category": The ingredient category (e.g., Produce, Dairy, Meat, Bakery, Pantry, Frozen, Other).
    - "status": "Pending" (default).
    The data should be returned in valid JSON format with no extra text.`;

    // Send the prompt to OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an assistant that processes grocery lists.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.2,
    });

    let assistantResponse = completion.choices[0].message.content.trim();
    
    // If the response starts or ends with non-JSON, clean it up
    const jsonStart = assistantResponse.indexOf('[');
    const jsonEnd = assistantResponse.lastIndexOf(']');
    
    if (jsonStart !== -1 && jsonEnd !== -1) {
      assistantResponse = assistantResponse.substring(jsonStart, jsonEnd + 1);
    }

    // Parse the assistant's response as JSON
    let structuredData;
    try {
      structuredData = JSON.parse(assistantResponse);
    } catch (parseError) {
      console.error('Error parsing assistant response:', parseError);
      return res.status(500).json({ error: 'Error parsing assistant response', assistantResponse });
    }

    // Add userId to each item and prepare data for SQL insertion
    const groceryListItems = structuredData.map(item => ({
      user_id: userId,  // Include the user ID
      item_name: item.item_name,
      quantity: item.quantity,
      metric: item.metric,
      category: item.category,
      status: 'Pending',  // Default status is 'Pending'
    }));

    // Insert the processed grocery list items into SQL
    const client = await pool.connect();
    await client.query('BEGIN');

    for (const item of groceryListItems) {
      const { user_id, item_name, quantity, metric, category, status } = item;

      await client.query(
        'INSERT INTO grocery_list (user_id, item_name, quantity, metric, category, status) VALUES ($1, $2, $3, $4, $5, $6)',
        [user_id, item_name, quantity, metric, category, status]
      );
    }

    await client.query('COMMIT');
    client.release();

    res.json({ success: true, groceryListItems });
  } catch (error) {
    console.error('Error processing ingredients:', error.message);
    res.status(500).json({ error: 'Error processing ingredients', details: error.message });
  }
});

// Endpoint to insert the processed grocery list items into the SQL table
app.post('/api/grocery-list', async (req, res) => {
  const { groceryListItems } = req.body;

  try {
    const client = await pool.connect();
    await client.query('BEGIN');
    
    for (const item of groceryListItems) {
      const { user_id, item_name, quantity, metric, category, status } = item;
      
      await client.query(
        'INSERT INTO grocery_list (user_id, item_name, quantity, metric, category, status) VALUES ($1, $2, $3, $4, $5, $6)',
        [user_id, item_name, quantity, metric, category, status]
      );
    }

    await client.query('COMMIT');
    client.release();
    res.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error inserting grocery list items:', error.message);
    res.status(500).json({ error: 'Error inserting grocery list items' });
  }
});
// Fetch grocery list by user id
app.get('/api/grocery-list/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM grocery_list WHERE user_id = $1 ORDER BY category ASC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching grocery list:', error);
    res.status(500).json({ error: 'Error fetching grocery list' });
  }
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


