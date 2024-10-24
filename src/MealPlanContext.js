// MealPlanContext.js

import React, { createContext, useState, useContext } from 'react';

const MealPlanContext = createContext();

export const useMealPlan = () => {
  return useContext(MealPlanContext);
};

export const MealPlanProvider = ({ children }) => {
  // Initialize mealPlans with the correct structure
  const [mealPlans, setMealPlans] = useState(() => {
    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];
    const initialMealPlans = {};

    weekDays.forEach(day => {
      initialMealPlans[day] = {};
      mealTypes.forEach(mealType => {
        initialMealPlans[day][mealType] = [];
      });
    });

    return initialMealPlans;
  });

  return (
    <MealPlanContext.Provider value={{ mealPlans, setMealPlans }}>
      {children}
    </MealPlanContext.Provider>
  );
};