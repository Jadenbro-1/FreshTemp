import SQLite from 'react-native-sqlite-storage';

SQLite.DEBUG(true);
SQLite.enablePromise(true);

const database_name = 'UserDatabase.db';
const database_version = '1.0';
const database_displayname = 'SQLite User Database';
const database_size = 200000;

const getDBConnection = async () => {
  try {
    const db = await SQLite.openDatabase(
      database_name,
      database_version,
      database_displayname,
      database_size
    );
    console.log('Database connection successful');
    return db;
  } catch (error) {
    console.error('Error opening database:', error.message);
    throw error;
  }
};

const createTables = async (db) => {
  const queries = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      phone TEXT,
      state TEXT,
      city TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS customizations (
      id INTEGER PRIMARY KEY,
      userId INTEGER,
      name TEXT,
      calories INTEGER,
      protein INTEGER,
      carbs INTEGER,
      fats INTEGER,
      FOREIGN KEY (userId) REFERENCES users(id)
    );`
  ];

  try {
    for (const query of queries) {
      await db.executeSql(query);
    }
    console.log('Database and tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error.message);
    throw error;
  }
};

const registerUser = async (db, user) => {
  const { firstName, lastName, email, password, phone, state, city } = user;
  try {
    const insertQuery = `INSERT INTO users (firstName, lastName, email, password, phone, state, city) VALUES (?, ?, ?, ?, ?, ?, ?);`;
    await db.executeSql(insertQuery, [firstName, lastName, email, password, phone, state, city]);
    console.log('User registered successfully');
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      console.error('Error: Email already exists');
      throw new Error('Email already exists');
    } else {
      console.error('Error during registration:', error.message);
      throw error;
    }
  }
};

const loginUser = async (db, email, password) => {
  try {
    const selectQuery = `SELECT * FROM users WHERE email = ? AND password = ?;`;
    const results = await db.executeSql(selectQuery, [email, password]);
    if (results[0].rows.length > 0) {
      return results[0].rows.item(0);
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error during login:', error.message);
    throw error;
  }
};

const getUserById = async (db, userId) => {
  try {
    const selectQuery = `SELECT * FROM users WHERE id = ?;`;
    const results = await db.executeSql(selectQuery, [userId]);
    if (results[0].rows.length > 0) {
      return results[0].rows.item(0);
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching user by ID:', error.message);
    throw error;
  }
};

const saveCustomization = async (db, userId, name, calories, protein, carbs, fats) => {
  try {
    const insertQuery = `INSERT INTO customizations (userId, name, calories, protein, carbs, fats) VALUES (?, ?, ?, ?, ?, ?);`;
    await db.executeSql(insertQuery, [userId, name, calories, protein, carbs, fats]);
    console.log('Customization saved successfully');
  } catch (error) {
    console.error('Error saving customization:', error.message);
    throw error;
  }
};

export {
  getDBConnection,
  createTables,
  registerUser,
  loginUser,
  getUserById,
  saveCustomization,
};
