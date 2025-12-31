
import React, { useState, useEffect } from 'react';
import { Heart, LayoutDashboard, Box, ShoppingCart, ChefHat, BarChart3, ClipboardList, History } from 'lucide-react';
import { format, addDays } from 'date-fns';
import Calendar from './components/Calendar';
import CubeManager from './components/CubeManager';
import OrderLog from './components/OrderLog';
import PreparationLog from './components/PreparationLog';
import RecipeHelper from './components/RecipeHelper';
import MealDetail from './components/MealDetail';
import StatsDashboard from './components/StatsDashboard';
import DayDetailModal from './components/DayDetailModal';
import ManufacturingLog from './components/ManufacturingLog';
import { DayPlan, CubeRecord, OrderRecord, MealRecord, PreparationRecord, Ingredient, ManufacturingRecord } from './types';

const STORAGE_KEYS = {
  PLANS: 'baby_food_plans_v1',
  CUBES: 'baby_food_cubes_v1',
  ORDERS: 'baby_food_orders_v1',
  PREPS: 'baby_food_preps_v1',
  WEIGHT: 'baby_food_weight_v1',
  STATUSES: 'baby_food_statuses_v1',
  ARCHIVE: 'baby_food_archive_v1'
};

const App: React.FC = () => {
  const getSavedData = <T,>(key: string, defaultValue: T): T => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      console.error(`Error loading ${key}:`, e);
      return defaultValue;
    }
  };

  const [plans, setPlans] = useState<DayPlan[]>(() => getSavedData(STORAGE_KEYS.PLANS, []));
  const [cubes, setCubes] = useState<CubeRecord[]>(() => getSavedData(STORAGE_KEYS.CUBES, []));
  const [orders, setOrders] = useState<OrderRecord[]>(() => getSavedData(STORAGE_KEYS.ORDERS, []));
  const [preps, setPreps] = useState<PreparationRecord[]>(() => getSavedData(STORAGE_KEYS.PREPS, []));
  const [manufacturingRecords, setManufacturingRecords] = useState<ManufacturingRecord[]>(() => getSavedData(STORAGE_KEYS.ARCHIVE, []));
  const [ingredientStatuses, setIngredientStatuses] = useState<Record<string, Ingredient['status']>>(() => getSavedData(STORAGE_KEYS.STATUSES, {}));
  const [weightPerCube, setWeightPerCube] = useState<number>(() => getSavedData(STORAGE_KEYS.WEIGHT, 20));

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'calendar' | 'cubes' | 'preps' | 'orders' | 'recipes' | 'stats' | 'archive'>('calendar');
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans)); }, [plans]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CUBES, JSON.stringify(cubes)); }, [cubes]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PREPS, JSON.stringify(preps)); }, [preps]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ARCHIVE, JSON.stringify(manufacturingRecords)); }, [manufacturingRecords]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.WEIGHT, weightPerCube.toString()); }, [weightPerCube]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.STATUSES, JSON.stringify(ingredientStatuses)); }, [ingredientStatuses]);

  const handleAddCube = (cubeData: Omit<CubeRecord, 'id'>) => {
    const newCube: CubeRecord = { ...cubeData, id: Math.random().toString(36).substr(2, 9) };
    setCubes(prev => [newCube, ...prev]);
  };

  const handleUpdateCube = (id: string, updates: Partial<CubeRecord>) => {
    setCubes(prev => prev.map(c => {
      if (c.id === id) {
        const updatedCube = { ...c, ...updates };
        if (updates.madeDate) {
          updatedCube.expiryDate = format(addDays(new Date(updates.madeDate), 14), 'yyyy-MM-dd');
        }
        return updatedCube;
      }
      return c;
    }));
  };

  const handleUpdateCubeQuantity = (id: string, delta: number) => {
    setCubes(prev => prev.map(c => {
      if (c.id === id) {
        const newQty = Math.max(0, c.quantity + delta);
        return { ...c, quantity: newQty };
      }
      return c;
    }));
  };

  const handleDeleteCube = (id: string) => {
    setCubes(prev => prev.filter(c => c.id !== id));
  };

  const handleFeedCube = (cubeId: string, time: string) => {
    const cube = cubes.find(c => c.id === cubeId);
    if (!cube || cube.quantity <= 0) return;
    
    handleUpdateCubeQuantity(cubeId, -1);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    // 개별 큐브의 무게가 있으면 사용하고, 없으면 전역 설정값(weightPerCube) 사용
    const actualWeight = cube.weight || weightPerCube;
    
    const newMeal: MealRecord = {
      id: Math.random().toString(36).substr(2, 9),
      title: `${cube.name} 큐브`,
      type: 'time_based',
      fedTime: time,
      ingredients: [{ name: cube.name, isNew: false, status: ingredientStatuses[cube.name] || 'success' }],
      notes: '큐브 급여',
      amount: `${actualWeight}g`,
      isFromCube: true,
      cubeId: cube.id
    };
    
    setPlans(prev => {
      const existingPlanIndex = prev.findIndex(p => p.date === dateStr);
      let updatedMeals;
      if (existingPlanIndex > -1) {
        updatedMeals = [...prev[existingPlanIndex].meals, newMeal];
      } else {
        updatedMeals = [newMeal];
      }
      updatedMeals.sort((a, b) => (a.fedTime || "").localeCompare(b.fedTime || ""));
      if (existingPlanIndex > -1) {
        const updatedPlans = [...prev];
        updatedPlans[existingPlanIndex] = { ...updatedPlans[existingPlanIndex], meals: updatedMeals };
        return updatedPlans;
      } else {
        return [...prev, { date: dateStr, meals: updatedMeals }];
      }
    });
  };

  const handleUpdateMeal = (mealId: string, updates: Partial<MealRecord>) => {
    setPlans(prev => prev.map(plan => ({
      ...plan,
      meals: plan.meals.map(meal => {
        if (meal.id === mealId) {
          const updatedMeal = { ...meal, ...updates };
          return updatedMeal;
        }
        return meal;
      }).sort((a, b) => (a.fedTime || "").localeCompare(b.fedTime || ""))
    })));
  };

  const handleDeleteMeal = (mealId: string) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const currentDayPlan = plans.find(p => p.date === dateStr);
    const mealToDelete = currentDayPlan?.meals.find(m => m.id === mealId);
    if (mealToDelete?.isFromCube && mealToDelete.cubeId) {
      handleUpdateCubeQuantity(mealToDelete.cubeId, 1);
    }
    setPlans(prev => prev.map(p => {
      if (p.date === dateStr) {
        return { ...p, meals: p.meals.filter(m => m.id !== mealId) };
      }
      return p;
    }));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsDayModalOpen(true);
  };

  const dayPlan = plans.find(p => p.date === format(selectedDate, 'yyyy-MM-dd'));
  const dayCubesMade = cubes.filter(c => c.madeDate === format(selectedDate, 'yyyy-MM-dd'));
  const dayPreps = preps.filter(p => p.prepDate === format(selectedDate, 'yyyy-MM-dd'));
  const dayOrders = orders.filter(o => o.orderDate === format(selectedDate, 'yyyy-MM-dd'));

  return (
    <div className="min-h-screen bg-slate-50 pb-24 sm:pb-8">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 px-4 sm:px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-pink-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
              <Heart className="text-pink-500 fill-pink-500 w-5 h-5 sm:w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">이진이 이유식</h1>
              <p className="hidden sm:block text-xs font-bold text-pink-500">정이진 사랑해</p>
            </div>
          </div>
          <div className="flex gap-1 sm:gap-2">
             <button onClick={() => setActiveTab('calendar')} className={`p-2 rounded-xl transition-all ${activeTab === 'calendar' ? 'bg-pink-50 text-pink-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} title="달력"><LayoutDashboard className="w-5 h-5 sm:w-6 h-6" /></button>
             <button onClick={() => setActiveTab('cubes')} className={`p-2 rounded-xl transition-all ${activeTab === 'cubes' ? 'bg-pink-50 text-pink-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} title="큐브관리"><Box className="w-5 h-5 sm:w-6 h-6" /></button>
             <button onClick={() => setActiveTab('preps')} className={`p-2 rounded-xl transition-all ${activeTab === 'preps' ? 'bg-amber-50 text-amber-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} title="제조 예정"><ClipboardList className="w-5 h-5 sm:w-6 h-6" /></button>
             <button onClick={() => setActiveTab('orders')} className={`p-2 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} title="주문"><ShoppingCart className="w-5 h-5 sm:w-6 h-6" /></button>
             <button onClick={() => setActiveTab('recipes')} className={`p-2 rounded-xl transition-all ${activeTab === 'recipes' ? 'bg-purple-50 text-purple-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} title="레시피"><ChefHat className="w-5 h-5 sm:w-6 h-6" /></button>
             <button onClick={() => setActiveTab('archive')} className={`p-2 rounded-xl transition-all ${activeTab === 'archive' ? 'bg-emerald-50 text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} title="아카이브"><History className="w-5 h-5 sm:w-6 h-6" /></button>
             <button onClick={() => setActiveTab('stats')} className={`p-2 rounded-xl transition-all ${activeTab === 'stats' ? 'bg-blue-50 text-blue-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} title="통계"><BarChart3 className="w-5 h-5 sm:w-6 h-6" /></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-3 sm:p-6 md:p-8">
        {activeTab === 'calendar' && (
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 md:gap-8 items-start">
            <div className="sm:col-span-7 lg:col-span-8">
              <Calendar plans={plans} cubes={cubes} orders={orders} preps={preps} selectedDate={selectedDate} onDateSelect={handleDateClick} />
            </div>
            <div className="sm:col-span-5 lg:col-span-4 h-full">
              <MealDetail date={selectedDate} plan={dayPlan} availableCubes={cubes.filter(c => c.quantity > 0)} onAddMeal={() => {}} onDeleteMeal={handleDeleteMeal} onFeedCube={handleFeedCube} onAIRecommend={() => setActiveTab('recipes')} />
            </div>
          </div>
        )}

        {activeTab === 'cubes' && <div className="max-w-2xl mx-auto"><CubeManager cubes={cubes} onAddCube={handleAddCube} onDeleteCube={handleDeleteCube} onUpdateQuantity={handleUpdateCubeQuantity} /></div>}

        {activeTab === 'preps' && <div className="max-w-2xl mx-auto"><PreparationLog preps={preps} onAddPrep={(d) => setPreps(prev => [{...d, id: Math.random().toString(36).substr(2, 9)}, ...prev])} onTogglePrep={(id) => setPreps(prev => prev.map(p => p.id === id ? { ...p, isCompleted: !p.isCompleted } : p))} onUpdatePrep={(id, u) => setPreps(prev => prev.map(p => p.id === id ? { ...p, ...u } : p))} onDeletePrep={(id) => setPreps(prev => prev.filter(p => p.id !== id))} /></div>}

        {activeTab === 'orders' && <div className="max-w-2xl mx-auto"><OrderLog orders={orders} onAddOrder={(d) => setOrders(prev => [{...d, id: Math.random().toString(36).substr(2, 9)}, ...prev])} onToggleOrder={(id) => setOrders(prev => prev.map(o => o.id === id ? { ...o, isReceived: !o.isReceived } : o))} onUpdateOrder={(id, u) => setOrders(prev => prev.map(o => o.id === id ? { ...o, ...u } : o))} onDeleteOrder={(id) => setOrders(prev => prev.filter(o => o.id !== id))} /></div>}

        {activeTab === 'recipes' && <div className="max-w-3xl mx-auto"><RecipeHelper weightPerCube={weightPerCube} onUpdateWeight={setWeightPerCube} /></div>}

        {activeTab === 'archive' && <div className="max-w-2xl mx-auto"><ManufacturingLog records={manufacturingRecords} onUpdateRecord={(id, u) => setManufacturingRecords(prev => prev.map(r => r.id === id ? {...r, ...u, updatedAt: new Date().toISOString()} : r))} onDeleteRecord={(id) => setManufacturingRecords(prev => prev.filter(r => r.id !== id))} /></div>}

        {activeTab === 'stats' && <div className="max-w-4xl mx-auto"><StatsDashboard plans={plans} cubes={cubes} weightPerCube={weightPerCube} ingredientStatuses={ingredientStatuses} onUpdateIngredientStatus={(name, status) => setIngredientStatuses(prev => ({ ...prev, [name]: status }))} /></div>}
      </main>

      <DayDetailModal 
        isOpen={isDayModalOpen} onClose={() => setIsDayModalOpen(false)} date={selectedDate} plan={dayPlan} cubesMade={dayCubesMade} preps={dayPreps} orders={dayOrders}
        onDeleteMeal={handleDeleteMeal} onUpdateMeal={handleUpdateMeal}
        onTogglePrep={(id) => setPreps(prev => prev.map(p => p.id === id ? { ...p, isCompleted: !p.isCompleted } : p))}
        onUpdatePrep={(id, u) => setPreps(prev => prev.map(p => p.id === id ? { ...p, ...u } : p))}
        onDeletePrep={(id) => setPreps(prev => prev.filter(p => p.id !== id))}
        onToggleOrder={(id) => setOrders(prev => prev.map(o => o.id === id ? { ...o, isReceived: !o.isReceived } : o))}
        onUpdateOrder={(id, u) => setOrders(prev => prev.map(o => o.id === id ? { ...o, ...u } : o))}
        onDeleteOrder={(id) => setOrders(prev => prev.filter(o => o.id !== id))}
        onUpdateCube={handleUpdateCube} onUpdateCubeQuantity={handleUpdateCubeQuantity}
      />
    </div>
  );
};

export default App;
