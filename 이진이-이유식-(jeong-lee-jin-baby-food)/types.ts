
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'time_based';

export interface Ingredient {
  name: string;
  isNew: boolean;
  status: 'none' | 'success' | 'allergic' | 'watching';
}

export interface MealRecord {
  id: string;
  title: string;
  type: MealType;
  fedTime?: string; // HH:mm format
  ingredients: Ingredient[];
  notes: string;
  amount: string;
  isFromCube?: boolean;
  cubeId?: string;
}

export interface DayPlan {
  date: string; // YYYY-MM-DD
  meals: MealRecord[];
}

export interface CubeRecord {
  id: string;
  name: string;
  madeDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  quantity: number;
  color: string; // HEX or Tailwind color class
  weight: number; // 개별 큐브의 무게 (10g ~ 100g)
}

export interface OrderRecord {
  id: string;
  itemName: string;
  orderDate: string;
  isReceived: boolean;
}

export interface PreparationRecord {
  id: string;
  itemName: string;
  prepDate: string; // YYYY-MM-DD
  isCompleted: boolean;
}

export interface SavedRecipe {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface PreparationPlan {
  id: string;
  itemName: string;
  requiredQuantity: number;
}

// Added ManufacturingRecord interface to fix the compilation error in components/ManufacturingLog.tsx
export interface ManufacturingRecord {
  id: string;
  title: string;
  cubeWeight: number;
  cubeCount: number;
  totalWeight: number;
  note?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}
