import { QueryClient } from '@tanstack/react-query';
import type { Recipe } from '../types';

// React Query の設定
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // キャッシュの有効期限を5分に設定
      staleTime: 5 * 60 * 1000, // 5 minutes
      // キャッシュが削除されるまでの時間を10分に設定
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      // エラー時の再試行設定
      retry: (failureCount, error) => {
        // DatabaseErrorは再試行しない
        if (error instanceof Error && error.name === 'DatabaseError') {
          return false;
        }
        // 最大3回まで再試行
        return failureCount < 3;
      },
      // リトライ間隔を指数的に増加
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // ミューテーション時のエラー再試行設定
      retry: false,
      // エラー時にクエリを無効化
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});

// クエリキーの定数定義
export const QUERY_KEYS = {
  // レシピ関連
  recipes: ['recipes'] as const,
  recipe: (id: string) => ['recipes', id] as const,
  favoriteRecipes: ['recipes', 'favorites'] as const,
  recentRecipes: ['recipes', 'recent'] as const,
  popularRecipes: ['recipes', 'popular'] as const,
  
  // 検索関連
  searchRecipes: (query: string) => ['recipes', 'search', query] as const,
  recipesByCategory: (category: string) => ['recipes', 'category', category] as const,
  
  // 統計関連
  stats: ['stats'] as const,
  
  // その他
  tags: ['tags'] as const,
  categories: ['categories'] as const,
} as const;

// キャッシュ操作のヘルパー関数
export const cacheUtils = {
  // 全レシピキャッシュを無効化
  invalidateRecipes: () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.recipes });
  },

  // 特定レシピキャッシュを無効化
  invalidateRecipe: (id: string) => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.recipe(id) });
  },

  // 統計キャッシュを無効化
  invalidateStats: () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
  },

  // 全キャッシュを無効化
  invalidateAll: () => {
    queryClient.invalidateQueries();
  },

  // 特定レシピをキャッシュに設定
  setRecipeCache: (recipe: Recipe) => {
    queryClient.setQueryData(QUERY_KEYS.recipe(recipe.id), recipe);
    
    // レシピリストのキャッシュも更新
    queryClient.setQueryData(QUERY_KEYS.recipes, (oldData: Recipe[] | undefined) => {
      if (!oldData) return [recipe];
      
      const existingIndex = oldData.findIndex(r => r.id === recipe.id);
      if (existingIndex >= 0) {
        // 既存レシピを更新
        const newData = [...oldData];
        newData[existingIndex] = recipe;
        return newData;
      } else {
        // 新しいレシピを追加
        return [recipe, ...oldData];
      }
    });
  },

  // キャッシュからレシピを削除
  removeRecipeFromCache: (id: string) => {
    queryClient.removeQueries({ queryKey: QUERY_KEYS.recipe(id) });
    
    // レシピリストからも削除
    queryClient.setQueryData(QUERY_KEYS.recipes, (oldData: Recipe[] | undefined) => {
      return oldData?.filter(recipe => recipe.id !== id) || [];
    });
  },

  // キャッシュサイズとメモリ使用量を取得
  getCacheInfo: () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    return {
      totalQueries: queries.length,
      staleQueries: queries.filter(q => q.getObserversCount() === 0).length,
      fetchingQueries: queries.filter(q => q.state.fetchStatus === 'fetching').length,
      errorQueries: queries.filter(q => q.state.status === 'error').length,
    };
  },
};

// エラーハンドリングのユーティリティ
export const errorUtils = {
  // エラーメッセージの取得
  getErrorMessage: (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return '予期しないエラーが発生しました';
  },

  // ユーザーフレンドリーなエラーメッセージに変換
  getUserFriendlyMessage: (error: unknown): string => {
    const message = errorUtils.getErrorMessage(error);
    
    // よくあるエラーパターンをユーザーフレンドリーに変換
    if (message.includes('IndexedDB')) {
      return 'データベースアクセスエラーが発生しました。ブラウザを再起動してみてください。';
    }
    if (message.includes('Network')) {
      return 'ネットワークエラーが発生しました。接続を確認してください。';
    }
    if (message.includes('not found')) {
      return '指定されたデータが見つかりませんでした。';
    }
    
    return message;
  },
};

// デバッグ用のヘルパー関数
export const debugUtils = {
  // クエリ状態をログ出力
  logQueryState: (queryKey: readonly unknown[]) => {
    const query = queryClient.getQueryState(queryKey);
    console.log(`Query [${queryKey.join(', ')}]:`, {
      status: query?.status,
      dataUpdatedAt: query?.dataUpdatedAt ? new Date(query.dataUpdatedAt) : null,
      error: query?.error,
    });
  },

  // 全クエリ状態をログ出力
  logAllQueries: () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    console.group('All Queries:');
    queries.forEach(query => {
      console.log(query.queryKey, {
        status: query.state.status,
        fetchStatus: query.state.fetchStatus,
        error: query.state.error,
      });
    });
    console.groupEnd();
  },
};