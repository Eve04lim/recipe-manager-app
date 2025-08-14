import Dexie, { type Table } from 'dexie';
import type { DifficultyLevel, Recipe, RecipeCategory } from '../types';

// IndexedDB データベースクラス
export class RecipeDatabase extends Dexie {
  recipes!: Table<Recipe>;

  constructor() {
    super('RecipeManagerDB');
    
    // データベーススキーマを定義
    this.version(1).stores({
      recipes: '++id, title, category, difficulty, createdAt, lastCooked, cookCount, *tags'
    });
  }
}

// データベースインスタンスを作成・エクスポート
export const db = new RecipeDatabase();

// 統計情報の型定義を追加
export interface DatabaseStats {
  totalRecipes: number;
  favoriteRecipes: number;
  totalCookTime: number;
  avgRating: number;
  mostCookedRecipe?: Recipe;
  recentlyAdded: Recipe[];
  categoryBreakdown: Record<RecipeCategory, number>;
  difficultyBreakdown: Record<DifficultyLevel, number>;
}

// データベース操作用のサービスクラス
export class RecipeService {
  // 全レシピを取得
  static async getAllRecipes(): Promise<Recipe[]> {
    return await db.recipes.toArray();
  }

  // レシピを追加
  static async addRecipe(recipe: Omit<Recipe, 'id'>): Promise<string> {
    const newRecipe = { ...recipe, id: crypto.randomUUID() };
    await db.recipes.add(newRecipe);
    return newRecipe.id;
  }

  // レシピを更新
  static async updateRecipe(id: string, updates: Partial<Recipe>): Promise<void> {
    await db.recipes.update(id, { 
      ...updates, 
      updatedAt: new Date().toISOString() 
    });
  }

  // レシピを削除
  static async deleteRecipe(id: string): Promise<void> {
    await db.recipes.delete(id);
  }

  // IDでレシピを取得
  static async getRecipeById(id: string): Promise<Recipe | undefined> {
    return await db.recipes.get(id);
  }

  // カテゴリ別でレシピを取得
  static async getRecipesByCategory(category: RecipeCategory): Promise<Recipe[]> {
    return await db.recipes.where('category').equals(category).toArray();
  }

  // お気に入りレシピを取得
  static async getFavoriteRecipes(): Promise<Recipe[]> {
    const allRecipes = await db.recipes.toArray();
    return allRecipes.filter(recipe => recipe.isFavorite);
  }

  // レシピを検索
  static async searchRecipes(query: string): Promise<Recipe[]> {
    const lowerQuery = query.toLowerCase();
    return await db.recipes
      .filter(recipe => 
        recipe.title.toLowerCase().includes(lowerQuery) ||
        recipe.description?.toLowerCase().includes(lowerQuery) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
        recipe.ingredients.some(ing => ing.name.toLowerCase().includes(lowerQuery))
      )
      .toArray();
  }

  // 統計情報を取得（型安全に修正）
  static async getStats(): Promise<DatabaseStats> {
    const recipes = await db.recipes.toArray();
    const favoriteCount = recipes.filter(r => r.isFavorite).length;
    const totalCookTime = recipes.reduce((sum, r) => sum + r.cookTime, 0);
    
    const ratedRecipes = recipes.filter(r => r.rating && r.rating > 0);
    const avgRating = ratedRecipes.length > 0 
      ? ratedRecipes.reduce((sum, r) => sum + (r.rating || 0), 0) / ratedRecipes.length
      : 0;

    // 最も多く作ったレシピを見つける
    const mostCookedRecipe = recipes.reduce((prev, current) => 
      (current.cookCount > (prev?.cookCount || 0)) ? current : prev, 
      recipes[0]
    );

    // 最近追加されたレシピ（5件）
    const recentlyAdded = recipes
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    // カテゴリ別の集計（型安全に）
    const categoryBreakdown = recipes.reduce((acc, recipe) => {
      const category = recipe.category as RecipeCategory;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<RecipeCategory, number>);

    // 難易度別の集計（型安全に）
    const difficultyBreakdown = recipes.reduce((acc, recipe) => {
      const difficulty = recipe.difficulty as DifficultyLevel;
      acc[difficulty] = (acc[difficulty] || 0) + 1;
      return acc;
    }, {} as Record<DifficultyLevel, number>);

    return {
      totalRecipes: recipes.length,
      favoriteRecipes: favoriteCount,
      totalCookTime,
      avgRating: Math.round(avgRating * 10) / 10,
      mostCookedRecipe: mostCookedRecipe?.cookCount > 0 ? mostCookedRecipe : undefined,
      recentlyAdded,
      categoryBreakdown,
      difficultyBreakdown,
    };
  }

  // データベースをクリア（開発用）
  static async clearDatabase(): Promise<void> {
    await db.recipes.clear();
  }

  // データをエクスポート
  static async exportData(): Promise<Recipe[]> {
    return await db.recipes.toArray();
  }

  // データをインポート
  static async importData(recipes: Recipe[]): Promise<void> {
    await db.recipes.bulkPut(recipes);
  }

  // 最近調理したレシピを取得
  static async getRecentlyCooked(limit: number = 10): Promise<Recipe[]> {
    const recipes = await db.recipes.toArray();
    return recipes
      .filter(recipe => recipe.lastCooked)
      .sort((a, b) => {
        if (!a.lastCooked || !b.lastCooked) return 0;
        return new Date(b.lastCooked).getTime() - new Date(a.lastCooked).getTime();
      })
      .slice(0, limit);
  }

  // 人気レシピを取得（調理回数順）
  static async getPopularRecipes(limit: number = 10): Promise<Recipe[]> {
    const recipes = await db.recipes.toArray();
    return recipes
      .sort((a, b) => b.cookCount - a.cookCount)
      .slice(0, limit);
  }
}