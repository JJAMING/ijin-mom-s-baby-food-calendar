export type MealSuggestion = {
  recipeName: string;
  ingredients: string[];
  instructions: string;
  stage?: string;
};

export async function getMealSuggestions(stage: string, currentIngredients: string[]) {
  const res = await fetch("/api/meal-suggestions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stage, currentIngredients }),
  });

  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return (data.items ?? []) as MealSuggestion[];
}

export async function searchRecipe(query: string, weightPerCube: number, targetCount: number) {
  const res = await fetch("/api/recipe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, weightPerCube, targetCount }),
  });

  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return (data.text ?? "") as string;
}

export async function getNutritionTips(ageInMonths: number) {
  const res = await fetch("/api/nutrition-tips", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ageInMonths }),
  });

  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return (data.text ?? "") as string;
}
