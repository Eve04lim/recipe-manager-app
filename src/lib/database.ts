import Dexie, { type Table } from 'dexie';
import type { Recipe } from '../types';

// IndexedDB データベースクラス
export class RecipeDatabase extends Dexie {
  recipes!: Table<Recipe>;

  constructor() {
    super('RecipeManagerDB');
    
    // データベーススキーマを定義（インデックスを修正）
    this.version(1).stores({
      recipes: '++id, title, category, difficulty, createdAt, lastCooked, cookCount, *tags'
      // isFavoriteはbooleanなのでインデックスから削除
    });
  }
}

// データベースインスタンスを作成・エクスポート
export const db = new RecipeDatabase();

// データベース操作用のサービスクラス
export class RecipeService {
  // 全レシピを取得
  static async getAllRecipes(): Promise<Recipe[]> {
    return await db.recipes.toArray();
  }

  // レシピを追加
  static async addRecipe(recipe: Omit<Recipe, 'id'>): Promise<string> {
    const id = await db.recipes.add({ ...recipe, id: '' });
    return id.toString();
  }

  // レシピを更新
  static async updateRecipe(id: string, updates: Partial<Recipe>): Promise<void> {
    await db.recipes.update(id, { ...updates, updatedAt: new Date().toISOString() });
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
  static async getRecipesByCategory(category: string): Promise<Recipe[]> {
    return await db.recipes.where('category').equals(category).toArray();
  }

  // ✅ お気に入りレシピを取得（修正版）
  static async getFavoriteRecipes(): Promise<Recipe[]> {
    return await db.recipes.filter(recipe => recipe.isFavorite === true).toArray();
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

  // ✅ 統計情報を取得（型を明確に指定）
  static async getStats(): Promise<RecipeStats> {
    const recipes = await db.recipes.toArray();
    const favoriteCount = recipes.filter(r => r.isFavorite).length;
    const totalCookTime = recipes.reduce((sum, r) => sum + r.cookTime, 0);
    
    // 評価のある レシピのみで平均を計算
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

    // カテゴリ別の集計
    const categoryBreakdown = recipes.reduce((acc, recipe) => {
      acc[recipe.category] = (acc[recipe.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 難易度別の集計
    const difficultyBreakdown = recipes.reduce((acc, recipe) => {
      acc[recipe.difficulty] = (acc[recipe.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return {
      totalRecipes: recipes.length,
      favoriteRecipes: favoriteCount,
      totalCookTime,
      avgRating: Math.round(avgRating * 10) / 10, // 小数点1位まで
      mostCookedRecipe: mostCookedRecipe?.cookCount > 0 ? mostCookedRecipe : undefined,
      recentlyAdded,
      categoryBreakdown: categoryBreakdown as any, // 一時的にanyを使用
      difficultyBreakdown: difficultyBreakdown as any, // 一時的にanyを使用
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
}