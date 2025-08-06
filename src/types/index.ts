// 計量単位
export type MeasurementUnit = 
  | 'g' | 'kg' 
  | 'ml' | 'l' | 'cc'
  | '個' | '本' | '枚' | '切れ'
  | '大さじ' | '小さじ' | 'カップ'
  | '少々' | 'ひとつまみ' | '適量';

// 料理カテゴリ
export type RecipeCategory = 
  | '主食' | '主菜' | '副菜' | 'スープ' 
  | 'サラダ' | 'デザート' | '飲み物'
  | '和食' | '洋食' | '中華' | 'イタリアン'
  | 'その他';

// 難易度（1=簡単、5=とても難しい）
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

// 材料
export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: MeasurementUnit;
  notes?: string; // 「みじん切り」「薄切り」などの備考
}

// 調理手順
export interface CookingStep {
  id: string;
  stepNumber: number;
  description: string;
  imageUrl?: string; // 手順の画像（オプション）
  timer?: number; // タイマー時間（分）
}

// 栄養情報（将来的に追加予定）
export interface NutritionInfo {
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  fiber?: number;
  sodium?: number;
}

// メインのレシピ型
export interface Recipe {
  id: string;
  title: string;
  description?: string;
  servings: number; // 何人分
  prepTime: number; // 準備時間（分）
  cookTime: number; // 調理時間（分）
  difficulty: DifficultyLevel;
  category: RecipeCategory;
  ingredients: Ingredient[];
  steps: CookingStep[];
  tags: string[]; // 「簡単」「ヘルシー」「子供向け」など
  imageUrl?: string;
  thumbnailUrl?: string;
  isFavorite: boolean;
  rating?: number; // 1-5の評価
  notes?: string; // 作った時のメモ
  nutritionInfo?: NutritionInfo;
  createdAt: string;
  updatedAt: string;
  lastCooked?: string; // 最後に作った日
  cookCount: number; // 作った回数
}

// レシピ検索・フィルタ用
export interface RecipeFilter {
  category?: RecipeCategory | 'all';
  difficulty?: DifficultyLevel;
  maxPrepTime?: number;
  maxCookTime?: number;
  tags?: string[];
  isFavorite?: boolean;
  hasImage?: boolean;
}

// レシピソート用
export interface RecipeSort {
  field: 'title' | 'createdAt' | 'lastCooked' | 'cookCount' | 'rating' | 'prepTime' | 'cookTime';
  direction: 'asc' | 'desc';
}

// 統計情報
export interface RecipeStats {
  totalRecipes: number;
  favoriteRecipes: number;
  totalCookTime: number; // 全レシピの調理時間合計
  avgRating: number;
  mostCookedRecipe?: Recipe;
  recentlyAdded: Recipe[];
  categoryBreakdown: Record<RecipeCategory, number>;
  difficultyBreakdown: Record<DifficultyLevel, number>;
}

// フォーム用の型
export interface RecipeFormData {
  title: string;
  description: string;
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: DifficultyLevel;
  category: RecipeCategory;
  ingredients: Omit<Ingredient, 'id'>[];
  steps: Omit<CookingStep, 'id'>[];
  tags: string[];
  imageUrl?: string;
}

// API response用
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

// エラー型
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}

// 他の型定義の後に追加

// 統計情報（修正版）
export interface RecipeStats {
  totalRecipes: number;
  favoriteRecipes: number;
  totalCookTime: number; // 全レシピの調理時間合計
  avgRating: number;
  mostCookedRecipe?: Recipe;
  recentlyAdded: Recipe[];
  categoryBreakdown: Record<RecipeCategory, number>;
  difficultyBreakdown: Record<DifficultyLevel, number>;
}