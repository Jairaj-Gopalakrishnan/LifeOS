
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { getAlchemistRecipes } from '../services/gemini';
import { 
  Activity, Utensils, ShoppingCart, Plus, Check, 
  Dumbbell, Flame, Clock, Loader2, ChevronRight, 
  Trash2, PlusCircle, ChefHat, Leaf, Salad, Egg,
  Globe, Info, X, Zap
} from 'lucide-react';

interface Workout {
  id: string;
  category: 'Strength' | 'Cardio' | 'Mobility';
  duration: number;
  intensity: 'Low' | 'Moderate' | 'High';
  date: string;
}

interface Recipe {
  name: string;
  culture: string;
  prepTime: string;
  protein: string;
  missingIngredients: string[];
  instructions: string;
}

type Diet = 'Vegetarian' | 'Vegan' | 'Non-Veg';
type Cuisine = 'All' | 'Dutch' | 'Arabic' | 'French' | 'International';

export const HealthAndFuel: React.FC = () => {
  const { addXp } = useAppContext();
  
  // Fitness State
  const [workouts, setWorkouts] = useState<Workout[]>(() => {
    const saved = localStorage.getItem('lifeos_workouts');
    return saved ? JSON.parse(saved) : [];
  });
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [newWorkout, setNewWorkout] = useState<Omit<Workout, 'id' | 'date'>>({
    category: 'Strength',
    duration: 45,
    intensity: 'Moderate'
  });

  // Food Alchemist State
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [diet, setDiet] = useState<Diet>('Vegetarian');
  const [cuisine, setCuisine] = useState<Cuisine>('All');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Grocery List State
  const [groceryList, setGroceryList] = useState<{ id: string; text: string; completed: boolean }[]>(() => {
    const saved = localStorage.getItem('lifeos_grocery');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('lifeos_workouts', JSON.stringify(workouts));
  }, [workouts]);

  useEffect(() => {
    localStorage.setItem('lifeos_grocery', JSON.stringify(groceryList));
  }, [groceryList]);

  const handleLogWorkout = () => {
    const workout: Workout = {
      ...newWorkout,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString()
    };
    setWorkouts([workout, ...workouts]);
    addXp(50);
    setShowWorkoutForm(false);
  };

  const handleLogMeal = () => {
    addXp(20);
    alert("Fuel logged. +20 XP gained for optimal biology.");
  };

  const fetchRecipes = async () => {
    if (!ingredients.trim()) return;
    setLoadingRecipes(true);
    setRecipes([]);
    try {
      const data = await getAlchemistRecipes(ingredients, diet, cuisine);
      setRecipes(data);
    } finally {
      setLoadingRecipes(false);
    }
  };

  const addToGrocery = (items: string[]) => {
    const newItems = items.map(text => ({
      id: Math.random().toString(36).substr(2, 9),
      text,
      completed: false
    }));
    setGroceryList([...groceryList, ...newItems]);
    alert(`${items.length} items added to Grocery List.`);
  };

  const toggleGrocery = (id: string) => {
    setGroceryList(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const clearCompleted = () => {
    setGroceryList(prev => prev.filter(item => !item.completed));
  };

  const diets: { label: Diet; icon: any }[] = [
    { label: 'Vegetarian', icon: Leaf },
    { label: 'Vegan', icon: Salad },
    { label: 'Non-Veg', icon: Utensils },
  ];

  const cuisines: Cuisine[] = ['All', 'Dutch', 'Arabic', 'French', 'International'];

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 pb-32 space-y-8">
      <header>
        <h1 className="text-3xl font-brand font-black text-white tracking-tight">Health & Fuel</h1>
        <p className="text-slate-400">Biological optimization & metabolic discipline.</p>
      </header>

      {/* Fitness Tracker */}
      <section className="glass rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-bold text-white">
            <Activity className="w-5 h-5 text-emerald-400" />
            Fitness Tracker
          </h3>
          <button 
            onClick={() => setShowWorkoutForm(!showWorkoutForm)}
            className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
          >
            {showWorkoutForm ? 'Close' : 'Log Workout'}
          </button>
        </div>

        {showWorkoutForm && (
          <div className="bg-slate-800/50 p-4 rounded-xl space-y-4 border border-slate-700 animate-in zoom-in-95 duration-200">
            <div className="grid grid-cols-3 gap-2">
              {(['Strength', 'Cardio', 'Mobility'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setNewWorkout({...newWorkout, category: cat})}
                  className={`py-2 text-xs rounded-lg border transition-all font-bold ${newWorkout.category === cat ? 'bg-emerald-500 text-slate-900 border-emerald-400' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Duration (min)</label>
                <input 
                  type="number" 
                  value={newWorkout.duration}
                  onChange={(e) => setNewWorkout({...newWorkout, duration: parseInt(e.target.value) || 0})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Intensity</label>
                <select 
                  value={newWorkout.intensity}
                  onChange={(e) => setNewWorkout({...newWorkout, intensity: e.target.value as any})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none appearance-none"
                >
                  <option>Low</option>
                  <option>Moderate</option>
                  <option>High</option>
                </select>
              </div>
            </div>
            <button 
              onClick={handleLogWorkout}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-2 rounded-xl shadow-lg shadow-emerald-500/10"
            >
              Finish & Gain 50 XP
            </button>
          </div>
        )}

        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {workouts.length === 0 ? (
            <p className="text-xs text-slate-600 italic text-center py-4">No data streams found for this cycle.</p>
          ) : (
            workouts.map(w => (
              <div key={w.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-800 rounded-lg">
                    <Dumbbell className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{w.category}</h4>
                    <p className="text-[10px] text-slate-500">{w.duration} min • {w.intensity} Intensity</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500">{new Date(w.date).toLocaleDateString()}</span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Food Alchemist Refactored */}
      <section className="glass rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-bold text-white">
            <ChefHat className="w-5 h-5 text-emerald-400" />
            Food Alchemist
          </h3>
          <button 
            onClick={handleLogMeal}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/5 px-2 py-1 rounded-md border border-emerald-500/20"
          >
            <Zap className="w-3 h-3" /> Log Fuel (+20 XP)
          </button>
        </div>

        {/* Inputs & Filters */}
        <div className="space-y-4">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Tag ingredients: lentils, spinach, onion..."
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchRecipes()}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-4 pr-12 py-4 text-sm text-white focus:border-emerald-500 outline-none shadow-inner transition-all group-hover:border-slate-600"
            />
            <button 
              onClick={fetchRecipes}
              disabled={loadingRecipes || !ingredients.trim()}
              className="absolute right-2 top-2 p-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-lg disabled:opacity-50 transition-all shadow-lg"
            >
              {loadingRecipes ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Dietary Preference Toggle */}
            <div className="flex-1 space-y-2">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Dietary Focus</span>
               <div className="flex p-1 bg-slate-800/80 rounded-xl border border-slate-700 gap-1">
                 {diets.map(({ label, icon: Icon }) => (
                   <button
                    key={label}
                    onClick={() => setDiet(label)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${diet === label ? 'bg-emerald-500 text-slate-900' : 'text-slate-500 hover:text-slate-300'}`}
                   >
                     <Icon className="w-3.5 h-3.5" />
                     {label}
                   </button>
                 ))}
               </div>
            </div>
            {/* Cuisine Filter */}
            <div className="flex-1 space-y-2">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Global Influence</span>
               <div className="flex flex-wrap gap-1">
                 {cuisines.map(c => (
                   <button
                    key={c}
                    onClick={() => setCuisine(c)}
                    className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition-all ${cuisine === c ? 'bg-slate-100 text-slate-900 border-slate-100' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                   >
                     {c}
                   </button>
                 ))}
               </div>
            </div>
          </div>
        </div>

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recipes.map((r, i) => (
            <div 
              key={i} 
              className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700 space-y-4 flex flex-col h-full hover:border-emerald-500/30 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                <ChefHat className="w-12 h-12 text-emerald-500" />
              </div>
              
              <div className="flex justify-between items-start relative z-10">
                <span className="text-[9px] font-black uppercase tracking-tighter text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">
                  {r.culture}
                </span>
                <div className="flex items-center gap-1 text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span className="text-[9px] font-bold">{r.prepTime}</span>
                </div>
              </div>

              <h4 className="font-bold text-slate-100 text-base leading-tight group-hover:text-emerald-400 transition-colors">{r.name}</h4>
              
              <div className="flex items-center gap-2 text-slate-300">
                 <Zap className="w-3 h-3 text-emerald-400" />
                 <span className="text-[10px] font-bold">{r.protein} Protein</span>
              </div>

              <div className="flex-1 space-y-3">
                 {r.missingIngredients.length > 0 ? (
                   <div className="pt-2">
                      <p className="text-[9px] uppercase font-black text-slate-500 mb-1 flex items-center gap-1">
                        <ShoppingCart className="w-3 h-3" /> What's Missing?
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {r.missingIngredients.map((item, idx) => (
                          <span key={idx} className="text-[9px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-400">
                            {item}
                          </span>
                        ))}
                      </div>
                   </div>
                 ) : (
                   <p className="text-[9px] text-emerald-500 font-bold flex items-center gap-1">
                     <Check className="w-3 h-3" /> Fully Equipped
                   </p>
                 )}
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedRecipe(r)}
                  className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-bold rounded-xl transition-all"
                >
                  View Method
                </button>
                {r.missingIngredients.length > 0 && (
                  <button 
                    onClick={() => addToGrocery(r.missingIngredients)}
                    className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-slate-900 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Smart Grocery List */}
      <section className="glass rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-bold text-white">
            <ShoppingCart className="w-5 h-5 text-emerald-400" />
            Smart Grocery List
          </h3>
          <button 
            onClick={clearCompleted}
            className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest"
          >
            Purge Complete
          </button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {groceryList.length === 0 ? (
            <div className="py-8 text-center border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center gap-2 opacity-50">
              <ShoppingCart className="w-8 h-8 text-slate-700" />
              <p className="text-xs text-slate-600">Logistic stream is clear.</p>
            </div>
          ) : (
            groceryList.map(item => (
              <div 
                key={item.id}
                onClick={() => toggleGrocery(item.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group ${item.completed ? 'bg-emerald-500/5 border-emerald-500/10 opacity-40' : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800 hover:border-slate-500'}`}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${item.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600 group-hover:border-emerald-500'}`}>
                  {item.completed && <Check className="w-3 h-3 text-slate-900" />}
                </div>
                <span className={`text-sm ${item.completed ? 'text-slate-500 line-through' : 'text-slate-200 font-medium'}`}>
                  {item.text}
                </span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setGroceryList(prev => prev.filter(i => i.id !== item.id));
                  }}
                  className="ml-auto p-1.5 text-slate-700 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Add quick logistics..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                addToGrocery([(e.target as HTMLInputElement).value]);
                (e.target as HTMLInputElement).value = '';
              }
            }}
          />
          <button className="p-3 bg-slate-800 text-emerald-500 border border-slate-700 rounded-xl hover:border-emerald-500 transition-all">
             <Plus className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Recipe Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-700 animate-in zoom-in-95 duration-300">
            <div className="p-6 space-y-4">
               <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-500 mb-1 block tracking-widest">{selectedRecipe.culture} Recipe</span>
                    <h2 className="text-2xl font-brand font-black text-white">{selectedRecipe.name}</h2>
                  </div>
                  <button 
                    onClick={() => setSelectedRecipe(null)}
                    className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
               </div>
               
               <div className="flex gap-4 p-3 bg-slate-800/50 rounded-2xl border border-slate-700">
                  <div className="flex-1 text-center border-r border-slate-700">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Prep Time</p>
                    <p className="text-sm font-bold text-emerald-400">{selectedRecipe.prepTime}</p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Protein</p>
                    <p className="text-sm font-bold text-emerald-400">{selectedRecipe.protein}</p>
                  </div>
               </div>

               <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Preparation Protocol</h4>
                  <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 max-h-60 overflow-y-auto custom-scrollbar">
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{selectedRecipe.instructions}</p>
                  </div>
               </div>

               <div className="pt-2">
                 <button 
                  onClick={() => setSelectedRecipe(null)}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-3 rounded-2xl transition-all shadow-xl shadow-emerald-500/20"
                 >
                   Return to Alchemist
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
