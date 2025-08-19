import Dexie, { type Table } from 'dexie';
import type { DifficultyLevel, Recipe, RecipeCategory } from '../types';

// エラーハンドリング用のカスタムエラー
export class DatabaseError extends Error {
  public cause?: unknown;
  
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'DatabaseError';
    this.cause = cause;
  }
}

// IndexedDB データベースクラス
export class RecipeDatabase extends Dexie {
  recipes!: Table<Recipe>;

  constructor() {
    super('RecipeManagerDB');
    
    console.log('🏗️ RecipeDatabase コンストラクタを実行中...');
    
    try {
      // データベーススキーマを定義（バージョン2でupdatedAtインデックスを追加）
      this.version(1).stores({
        recipes: '++id, title, category, difficulty, createdAt, lastCooked, cookCount, isFavorite, *tags'
      });

      // バージョン2: updatedAtインデックスを追加
      this.version(2).stores({
        recipes: '++id, title, category, difficulty, createdAt, updatedAt, lastCooked, cookCount, isFavorite, *tags'
      }).upgrade(trans => {
        console.log('🔄 データベースをバージョン2にアップグレード中...');
        // 既存のレシピにupdatedAtを追加
        return trans.recipes.toCollection().modify(recipe => {
          if (!recipe.updatedAt) {
            recipe.updatedAt = recipe.createdAt || new Date().toISOString();
          }
        });
      });

      console.log('✅ データベーススキーマの定義完了');

      // イベントハンドラを安全に設定
      this.setupEventHandlers();
      this.setupHooks();

    } catch (error) {
      console.error('❌ RecipeDatabase コンストラクタでエラー:', error);
      throw new DatabaseError('データベースの初期化に失敗しました', error);
    }
  }

  private setupEventHandlers() {
    try {
      // Dexieのイベントハンドラが利用可能かチェック
      if (typeof this.on === 'function') {
        this.on('opening', () => {
          console.log('📂 データベースを開いています...');
        });

        this.on('ready', () => {
          console.log('✅ データベースの準備が完了しました');
        });

        this.on('error', (error) => {
          console.error('❌ データベースエラー:', error);
        });

        console.log('✅ イベントハンドラの設定完了');
      } else {
        console.log('ℹ️ イベントハンドラはスキップされました（利用不可）');
      }
    } catch (error) {
      console.log('ℹ️ イベントハンドラの設定をスキップしました:', error);
      // イベントハンドラのエラーは致命的ではないので続行
    }
  }

  private setupHooks() {
    try {
      // フックを追加してデータの整合性を保つ
      this.recipes.hook('creating', (_primKey, obj) => {
        console.log('➕ レシピを作成中:', obj.title);
        const now = new Date().toISOString();
        obj.id = obj.id || crypto.randomUUID();
        obj.createdAt = obj.createdAt || now;
        obj.updatedAt = obj.updatedAt || now;
        obj.cookCount = obj.cookCount || 0;
        obj.isFavorite = obj.isFavorite || false;
      });

      this.recipes.hook('updating', (modifications) => {
        console.log('🔄 レシピを更新中...');
        (modifications as Record<string, unknown>).updatedAt = new Date().toISOString();
      });

      this.recipes.hook('deleting', (_primKey, obj) => {
        console.log('🗑️ レシピを削除中:', obj.title);
      });

      console.log('✅ データベースフックの設定完了');
    } catch (error) {
      console.error('❌ フックの設定に失敗:', error);
      // フックのエラーも致命的ではないので続行
    }
  }
}

// データベースインスタンスの安全な作成
let db: RecipeDatabase;

const createDatabase = (): RecipeDatabase => {
  try {
    console.log('🔧 データベースインスタンスを作成中...');
    
    // 既存のデータベースが開いている場合は閉じる
    if (db && db.isOpen()) {
      console.log('🔒 既存のデータベースを閉じています...');
      db.close();
    }
    
    db = new RecipeDatabase();
    console.log('✅ データベースインスタンスの作成完了');
    return db;
  } catch (error) {
    console.error('❌ データベースインスタンスの作成に失敗:', error);
    throw new DatabaseError('データベースインスタンスの作成に失敗しました', error);
  }
};

// データベースインスタンスを作成
export { createDatabase };
export const getDatabase = (): RecipeDatabase => {
  if (!db) {
    db = createDatabase();
  }
  return db;
};

// 統計情報の型定義
export interface DatabaseStats {
  totalRecipes: number;
  favoriteRecipes: number;
  totalCookTime: number;
  avgRating: number;
  mostCookedRecipe?: Recipe;
  recentlyAdded: Recipe[];
  categoryBreakdown: Record<RecipeCategory, number>;
  difficultyBreakdown: Record<DifficultyLevel, number>;
  lastWeekAdded: number;
  popularTags: { tag: string; count: number }[];
}

// データベース操作用のサービスクラス
export class RecipeService {
  private static getDb(): RecipeDatabase {
    return getDatabase();
  }

  // データベースの再作成（スキーマエラー対応）
  static async recreateDatabase(): Promise<void> {
    try {
      console.log('🔄 データベースの再作成を開始...');
      
      const database = this.getDb();
      
      // 既存のデータをバックアップ
      let existingData: Recipe[] = [];
      try {
        if (database.isOpen()) {
          existingData = await database.recipes.toArray();
          console.log(`💾 ${existingData.length}件のデータをバックアップしました`);
        }
      } catch (backupError) {
        console.warn('⚠️ データのバックアップに失敗（続行します）:', backupError);
      }
      
      // データベースを閉じて削除
      if (database.isOpen()) {
        database.close();
      }
      await database.delete();
      console.log('🗑️ 古いデータベースを削除しました');
      
      // 新しいデータベースを作成
      await database.open();
      console.log('✅ 新しいデータベースを作成しました');
      
      // データを復元
      if (existingData.length > 0) {
        console.log(`🔄 ${existingData.length}件のデータを復元中...`);
        
        // updatedAtが存在しない場合は追加
        const updatedData = existingData.map(recipe => ({
          ...recipe,
          updatedAt: recipe.updatedAt || recipe.createdAt || new Date().toISOString()
        }));
        
        await database.recipes.bulkAdd(updatedData);
        console.log('✅ データの復元完了');
      }
      
    } catch (error) {
      console.error('❌ データベースの再作成に失敗:', error);
      throw new DatabaseError('データベースの再作成に失敗しました', error);
    }
  }
  static async initializeDatabase(): Promise<void> {
    try {
      console.log('🔧 データベースの初期化を開始...');
      
      const database = this.getDb();
      
      // データベースを開く
      await database.open();
      console.log('✅ データベースの初期化完了');
      
      // テストクエリを実行してデータベースが正常に動作することを確認
      const testCount = await database.recipes.count();
      console.log(`📊 現在のレシピ数: ${testCount}件`);
      
    } catch (error) {
      console.error('❌ データベースの初期化に失敗:', error);
      
      // データベースを削除して再作成を試行
      try {
        console.log('🔄 データベースのリセットを試行...');
        const database = this.getDb();
        await database.delete();
        await database.open();
        console.log('✅ データベースのリセットに成功');
      } catch (resetError) {
        console.error('❌ データベースのリセットにも失敗:', resetError);
        throw new DatabaseError('データベースの初期化に完全に失敗しました', resetError);
      }
    }
  }

  // 全レシピを取得
  static async getAllRecipes(): Promise<Recipe[]> {
    try {
      console.log('🔍 データベースからレシピを取得中...');
      
      const database = this.getDb();
      
      // データベースの接続状態を確認
      if (!database.isOpen()) {
        console.log('📂 データベースを開いています...');
        await database.open();
      }
      
      // まず全てのレシピを取得
      const recipes = await database.recipes.toArray();
      
      // メモリ上でソート（updatedAtインデックスがない場合の対策）
      recipes.sort((a, b) => {
        const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return bTime - aTime; // 降順
      });
      
      console.log(`✅ ${recipes.length}件のレシピを取得しました`);
      return recipes;
    } catch (error) {
      console.error('❌ RecipeService.getAllRecipes エラー詳細:', error);
      
      // より詳細なエラー情報をログ出力
      if (error instanceof Error) {
        console.error('エラー名:', error.name);
        console.error('エラーメッセージ:', error.message);
        console.error('スタックトレース:', error.stack);
      }
      
      // スキーマエラーの場合はデータベースを再作成
      if (error instanceof Error && (
        error.name === 'SchemaError' ||
        error.message.includes('not indexed') ||
        error.message.includes('KeyPath')
      )) {
        console.log('🔄 スキーマエラーのためデータベースを再作成します...');
        try {
          await this.recreateDatabase();
          return await this.getDb().recipes.toArray(); // 再度取得を試行
        } catch (recreateError) {
          console.error('❌ データベースの再作成に失敗:', recreateError);
          throw new DatabaseError('データベースの再作成に失敗しました', recreateError);
        }
      }
      
      // データベース関連のエラーかチェック
      if (error instanceof Error && (
        error.name === 'InvalidStateError' || 
        error.name === 'NotFoundError' ||
        error.message.includes('database') ||
        error.message.includes('IndexedDB')
      )) {
        console.log('🔄 データベースの再初期化を試行します...');
        try {
          await this.initializeDatabase();
          return await this.getDb().recipes.toArray(); // 再度取得を試行
        } catch (reinitError) {
          console.error('❌ データベースの再初期化に失敗:', reinitError);
          throw new DatabaseError('データベースの初期化に失敗しました', reinitError);
        }
      }
      
      throw new DatabaseError('レシピの取得に失敗しました', error);
    }
  }

  // レシピをIDで取得
  static async getRecipeById(id: string): Promise<Recipe | undefined> {
    try {
      const database = this.getDb();
      return await database.recipes.get(id);
    } catch (error) {
      throw new DatabaseError(`レシピ(ID: ${id})の取得に失敗しました`, error);
    }
  }

  // レシピを追加
  static async addRecipe(recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'cookCount'>): Promise<Recipe> {
    try {
      console.log('➕ 新しいレシピを追加中:', recipe.title);
      
      const database = this.getDb();
      
      // データベースが開いているか確認
      if (!database.isOpen()) {
        await database.open();
      }
      
      const newRecipe: Recipe = {
        ...recipe,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        cookCount: 0,
      };
      
      await database.recipes.add(newRecipe);
      console.log('✅ レシピの追加に成功:', newRecipe.title);
      return newRecipe;
    } catch (error) {
      console.error('❌ レシピの追加に失敗:', error);
      throw new DatabaseError('レシピの追加に失敗しました', error);
    }
  }

  // レシピを更新
  static async updateRecipe(id: string, updates: Partial<Recipe>): Promise<Recipe> {
    try {
      const database = this.getDb();
      const existingRecipe = await database.recipes.get(id);
      if (!existingRecipe) {
        throw new DatabaseError(`レシピ(ID: ${id})が見つかりません`);
      }

      const updatedRecipe = {
        ...existingRecipe,
        ...updates,
        id, // IDは変更不可
        updatedAt: new Date().toISOString(),
      };

      await database.recipes.update(id, updatedRecipe);
      return updatedRecipe;
    } catch (error) {
      throw new DatabaseError('レシピの更新に失敗しました', error);
    }
  }

  // レシピを削除
  static async deleteRecipe(id: string): Promise<void> {
    try {
      const database = this.getDb();
      await database.recipes.delete(id);
      // Dexieのdeleteは削除された件数ではなくvoidを返すので、
      // 削除の成功は例外が発生しないことで確認
    } catch (error) {
      throw new DatabaseError('レシピの削除に失敗しました', error);
    }
  }

  // 複数レシピを削除
  static async deleteRecipes(ids: string[]): Promise<void> {
    try {
      const database = this.getDb();
      await database.transaction('rw', database.recipes, async () => {
        for (const id of ids) {
          await database.recipes.delete(id);
        }
      });
    } catch (error) {
      throw new DatabaseError('レシピの一括削除に失敗しました', error);
    }
  }

  // カテゴリ別でレシピを取得
  static async getRecipesByCategory(category: RecipeCategory): Promise<Recipe[]> {
    try {
      const database = this.getDb();
      return await database.recipes.where('category').equals(category).toArray();
    } catch (error) {
      throw new DatabaseError(`カテゴリ「${category}」のレシピ取得に失敗しました`, error);
    }
  }

  // お気に入りレシピを取得
  static async getFavoriteRecipes(): Promise<Recipe[]> {
    try {
      const database = this.getDb();
      const allRecipes = await database.recipes.toArray();
      return allRecipes.filter(recipe => recipe.isFavorite);
    } catch (error) {
      throw new DatabaseError('お気に入りレシピの取得に失敗しました', error);
    }
  }

  // レシピを検索
  static async searchRecipes(query: string): Promise<Recipe[]> {
    try {
      const database = this.getDb();
      const lowerQuery = query.toLowerCase();
      return await database.recipes
        .filter(recipe => 
          recipe.title.toLowerCase().includes(lowerQuery) ||
          recipe.description?.toLowerCase().includes(lowerQuery) ||
          recipe.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
          recipe.ingredients.some(ing => ing.name.toLowerCase().includes(lowerQuery))
        )
        .toArray();
    } catch (error) {
      throw new DatabaseError('レシピの検索に失敗しました', error);
    }
  }

  // レシピの調理回数を増やす
  static async incrementCookCount(id: string): Promise<Recipe> {
    try {
      const database = this.getDb();
      const recipe = await database.recipes.get(id);
      if (!recipe) {
        throw new DatabaseError(`レシピ(ID: ${id})が見つかりません`);
      }

      const updates = {
        cookCount: recipe.cookCount + 1,
        lastCooked: new Date().toISOString(),
      };

      await database.recipes.update(id, updates);
      return { ...recipe, ...updates, updatedAt: new Date().toISOString() };
    } catch (error) {
      throw new DatabaseError('調理回数の更新に失敗しました', error);
    }
  }

  // 統計情報を取得
  static async getStats(): Promise<DatabaseStats> {
    try {
      const database = this.getDb();
      const recipes = await database.recipes.toArray();
      const favoriteCount = recipes.filter(r => r.isFavorite).length;
      const totalCookTime = recipes.reduce((sum, r) => sum + r.cookTime + r.prepTime, 0);
      
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

      // 先週追加されたレシピ数
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const lastWeekAdded = recipes.filter(r => 
        new Date(r.createdAt) >= oneWeekAgo
      ).length;

      // カテゴリ別の集計
      const categoryBreakdown = recipes.reduce((acc, recipe) => {
        const category = recipe.category as RecipeCategory;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<RecipeCategory, number>);

      // 難易度別の集計
      const difficultyBreakdown = recipes.reduce((acc, recipe) => {
        const difficulty = recipe.difficulty as DifficultyLevel;
        acc[difficulty] = (acc[difficulty] || 0) + 1;
        return acc;
      }, {} as Record<DifficultyLevel, number>);

      // 人気タグの集計
      const tagCounts = recipes.reduce((acc, recipe) => {
        recipe.tags.forEach(tag => {
          acc[tag] = (acc[tag] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>);

      const popularTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        totalRecipes: recipes.length,
        favoriteRecipes: favoriteCount,
        totalCookTime,
        avgRating: Math.round(avgRating * 10) / 10,
        mostCookedRecipe: mostCookedRecipe?.cookCount > 0 ? mostCookedRecipe : undefined,
        recentlyAdded,
        categoryBreakdown,
        difficultyBreakdown,
        lastWeekAdded,
        popularTags,
      };
    } catch (error: unknown) {
      throw new DatabaseError('統計情報の取得に失敗しました', error);
    }
  }

  // データベースをクリア（開発用）
  static async clearDatabase(): Promise<void> {
    try {
      const database = this.getDb();
      await database.recipes.clear();
    } catch (error) {
      throw new DatabaseError('データベースのクリアに失敗しました', error);
    }
  }

  // データをエクスポート
  static async exportData(): Promise<Recipe[]> {
    try {
      const database = this.getDb();
      return await database.recipes.toArray();
    } catch (error) {
      throw new DatabaseError('データのエクスポートに失敗しました', error);
    }
  }

  // データをインポート
  static async importData(recipes: Recipe[]): Promise<void> {
    try {
      const database = this.getDb();
      await database.transaction('rw', database.recipes, async () => {
        await database.recipes.clear();
        await database.recipes.bulkAdd(recipes);
      });
    } catch (error) {
      throw new DatabaseError('データのインポートに失敗しました', error);
    }
  }

  // 最近調理したレシピを取得
  static async getRecentlyCooked(limit: number = 10): Promise<Recipe[]> {
    try {
      const database = this.getDb();
      const recipes = await database.recipes.toArray();
      return recipes
        .filter(recipe => recipe.lastCooked)
        .sort((a, b) => {
          if (!a.lastCooked || !b.lastCooked) return 0;
          return new Date(b.lastCooked).getTime() - new Date(a.lastCooked).getTime();
        })
        .slice(0, limit);
    } catch (error) {
      throw new DatabaseError('最近調理したレシピの取得に失敗しました', error);
    }
  }

  // 人気レシピを取得（調理回数順）
  static async getPopularRecipes(limit: number = 10): Promise<Recipe[]> {
    try {
      const database = this.getDb();
      
      // メモリ上でソート（cookCountインデックスがない場合の対策）
      const recipes = await database.recipes.toArray();
      return recipes
        .sort((a, b) => b.cookCount - a.cookCount)
        .slice(0, limit);
    } catch (error) {
      throw new DatabaseError('人気レシピの取得に失敗しました', error);
    }
  }

  // データベースの状態を取得
  static async getDatabaseStatus(): Promise<{
    isOpen: boolean;
    recipeCount: number;
    databaseName: string;
    version: number;
  }> {
    try {
      const database = this.getDb();
      const isOpen = database.isOpen();
      console.log(`📊 データベース状態: ${isOpen ? '開いている' : '閉じている'}`);
      
      if (!isOpen) {
        await database.open();
      }
      
      const recipeCount = await database.recipes.count();
      
      return {
        isOpen: database.isOpen(),
        recipeCount,
        databaseName: database.name,
        version: database.verno,
      };
    } catch (error) {
      console.error('❌ データベース状態の取得に失敗:', error);
      throw new DatabaseError('データベース状態の取得に失敗しました', error);
    }
  }

  // データベースの整合性チェック
  static async validateDatabase(): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      console.log('🔍 データベースの整合性チェックを開始...');
      
      const database = this.getDb();
      
      // データベースが開いているかチェック
      if (!database.isOpen()) {
        await database.open();
      }
      
      const recipes = await database.recipes.toArray();
      const errors: string[] = [];

      console.log(`📊 チェック対象: ${recipes.length}件のレシピ`);

      recipes.forEach((recipe, index) => {
        if (!recipe.id) errors.push(`Recipe ${index}: IDが不正です`);
        if (!recipe.title?.trim()) errors.push(`Recipe ${recipe.id}: タイトルが空です`);
        if (recipe.ingredients.length === 0) errors.push(`Recipe ${recipe.id}: 材料が空です`);
        if (recipe.steps.length === 0) errors.push(`Recipe ${recipe.id}: 手順が空です`);
      });

      const isValid = errors.length === 0;
      console.log(isValid ? '✅ データベースの整合性に問題なし' : `⚠️ ${errors.length}個の問題を発見`);

      return { isValid, errors };
    } catch (error) {
      console.error('❌ データベースの整合性チェックに失敗:', error);
      throw new DatabaseError('データベースの整合性チェックに失敗しました', error);
    }
  }
}

// 初期化の実行は明示的に行う
console.log('📦 database.ts モジュールが読み込まれました');

// デバッグ用のユーティリティ関数をグローバルに公開（開発環境のみ）
if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
  ((window as unknown) as Record<string, unknown>).recipeUtils = {
    initializeDatabase: RecipeService.initializeDatabase,
    getDatabaseStatus: RecipeService.getDatabaseStatus,
    validateDatabase: RecipeService.validateDatabase,
    clearDatabase: RecipeService.clearDatabase,
    exportData: RecipeService.exportData,
    importData: RecipeService.importData,
  };
  
  console.log('🛠️ Recipe Database Utils Available:', {
    'window.recipeUtils.getDatabaseStatus()': 'データベース状態を表示',
    'window.recipeUtils.validateDatabase()': 'データベースの整合性チェック',
    'window.recipeUtils.clearDatabase()': 'データベースをクリア',
  });
}