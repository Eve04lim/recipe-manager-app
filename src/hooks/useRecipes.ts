import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RecipeService } from '../lib/database';
import { QUERY_KEYS, cacheUtils, errorUtils } from '../lib/queryClient';
import type { Recipe, RecipeCategory } from '../types';

// 全レシピを取得するフック
export const useRecipes = () => {
  return useQuery({
    queryKey: QUERY_KEYS.recipes,
    queryFn: async () => {
      try {
        console.log('📊 レシピデータを取得中...');
        const recipes = await RecipeService.getAllRecipes();
        console.log(`✅ ${recipes.length}件のレシピを取得しました`);
        return recipes;
      } catch (error) {
        console.error('❌ レシピの取得に失敗:', error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2分
    retry: (failureCount, error) => {
      console.log(`🔄 リトライ ${failureCount}回目:`, error);
      // データベースエラーの場合は3回まで再試行
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
};

// 特定のレシピを取得するフック
export const useRecipe = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.recipe(id),
    queryFn: () => RecipeService.getRecipeById(id),
    enabled: !!id, // idが存在する時のみクエリを実行
    staleTime: 5 * 60 * 1000, // 5分
  });
};

// お気に入りレシピを取得するフック
export const useFavoriteRecipes = () => {
  return useQuery({
    queryKey: QUERY_KEYS.favoriteRecipes,
    queryFn: RecipeService.getFavoriteRecipes,
    staleTime: 1 * 60 * 1000, // 1分
  });
};

// 人気レシピを取得するフック
export const usePopularRecipes = (limit: number = 10) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.popularRecipes, limit],
    queryFn: () => RecipeService.getPopularRecipes(limit),
    staleTime: 10 * 60 * 1000, // 10分
  });
};

// 最近調理したレシピを取得するフック
export const useRecentlyCooked = (limit: number = 10) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.recentRecipes, limit],
    queryFn: () => RecipeService.getRecentlyCooked(limit),
    staleTime: 1 * 60 * 1000, // 1分
  });
};

// カテゴリ別レシピを取得するフック
export const useRecipesByCategory = (category: RecipeCategory) => {
  return useQuery({
    queryKey: QUERY_KEYS.recipesByCategory(category),
    queryFn: () => RecipeService.getRecipesByCategory(category),
    enabled: !!category,
    staleTime: 5 * 60 * 1000, // 5分
  });
};

// レシピ検索フック
export const useSearchRecipes = (query: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.searchRecipes(query),
    queryFn: () => RecipeService.searchRecipes(query),
    enabled: query.trim().length >= 2, // 2文字以上で検索
    staleTime: 30 * 1000, // 30秒
  });
};

// 統計情報を取得するフック
export const useStats = () => {
  return useQuery({
    queryKey: QUERY_KEYS.stats,
    queryFn: RecipeService.getStats,
    staleTime: 5 * 60 * 1000, // 5分
  });
};

// レシピ追加のミューテーション
export const useAddRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recipeData: Parameters<typeof RecipeService.addRecipe>[0]) =>
      RecipeService.addRecipe(recipeData),
    
    onMutate: async (newRecipe) => {
      // 楽観的更新：UIを即座に更新
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.recipes });
      
      const previousRecipes = queryClient.getQueryData<Recipe[]>(QUERY_KEYS.recipes);
      
      // 一時的な仮のレシピを作成
      const tempRecipe: Recipe = {
        ...newRecipe,
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        cookCount: 0,
      };
      
      // レシピリストに一時追加
      queryClient.setQueryData<Recipe[]>(QUERY_KEYS.recipes, (old) => 
        old ? [tempRecipe, ...old] : [tempRecipe]
      );
      
      return { previousRecipes, tempRecipe };
    },
    
    onSuccess: (savedRecipe, _variables, context) => {
      // 成功時：一時的なレシピを実際のデータに置き換え
      queryClient.setQueryData<Recipe[]>(QUERY_KEYS.recipes, (old) =>
        old?.map(recipe => 
          recipe.id === context?.tempRecipe.id ? savedRecipe : recipe
        ) || [savedRecipe]
      );
      
      // 関連キャッシュを無効化
      cacheUtils.invalidateStats();
    },
    
    onError: (error, _variables, context) => {
      // エラー時：楽観的更新をロールバック
      if (context?.previousRecipes) {
        queryClient.setQueryData(QUERY_KEYS.recipes, context.previousRecipes);
      }
      
      console.error('レシピ追加エラー:', error);
    },
  });
};

// レシピ更新のミューテーション
export const useUpdateRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Recipe> }) =>
      RecipeService.updateRecipe(id, updates),
    
    onMutate: async ({ id, updates }) => {
      // 楽観的更新
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.recipe(id) });
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.recipes });
      
      const previousRecipe = queryClient.getQueryData<Recipe>(QUERY_KEYS.recipe(id));
      const previousRecipes = queryClient.getQueryData<Recipe[]>(QUERY_KEYS.recipes);
      
      if (previousRecipe) {
        const updatedRecipe = { ...previousRecipe, ...updates };
        
        // 個別レシピキャッシュを更新
        queryClient.setQueryData(QUERY_KEYS.recipe(id), updatedRecipe);
        
        // レシピリストも更新
        queryClient.setQueryData<Recipe[]>(QUERY_KEYS.recipes, (old) =>
          old?.map(recipe => recipe.id === id ? updatedRecipe : recipe) || []
        );
      }
      
      return { previousRecipe, previousRecipes };
    },
    
    onSuccess: (updatedRecipe) => {
      // 成功時：キャッシュを最新データで更新
      cacheUtils.setRecipeCache(updatedRecipe);
      cacheUtils.invalidateStats();
    },
    
    onError: (error, { id }, context) => {
      // エラー時：ロールバック
      if (context?.previousRecipe) {
        queryClient.setQueryData(QUERY_KEYS.recipe(id), context.previousRecipe);
      }
      if (context?.previousRecipes) {
        queryClient.setQueryData(QUERY_KEYS.recipes, context.previousRecipes);
      }
      
      console.error('レシピ更新エラー:', error);
    },
  });
};

// レシピ削除のミューテーション
export const useDeleteRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => RecipeService.deleteRecipe(id),
    
    onMutate: async (id) => {
      // 楽観的更新：削除対象を即座にUIから除去
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.recipes });
      
      const previousRecipes = queryClient.getQueryData<Recipe[]>(QUERY_KEYS.recipes);
      const deletedRecipe = previousRecipes?.find(recipe => recipe.id === id);
      
      // レシピリストから削除
      queryClient.setQueryData<Recipe[]>(QUERY_KEYS.recipes, (old) =>
        old?.filter(recipe => recipe.id !== id) || []
      );
      
      // 個別キャッシュも削除
      queryClient.removeQueries({ queryKey: QUERY_KEYS.recipe(id) });
      
      return { previousRecipes, deletedRecipe };
    },
    
    onSuccess: (_, id) => {
      // 成功時：関連キャッシュを無効化
      cacheUtils.removeRecipeFromCache(id);
      cacheUtils.invalidateStats();
    },
    
    onError: (error, id, context) => {
      // エラー時：削除したレシピを復元
      if (context?.previousRecipes) {
        queryClient.setQueryData(QUERY_KEYS.recipes, context.previousRecipes);
      }
      if (context?.deletedRecipe) {
        queryClient.setQueryData(QUERY_KEYS.recipe(id), context.deletedRecipe);
      }
      
      console.error('レシピ削除エラー:', error);
    },
  });
};

// 複数レシピ削除のミューテーション
export const useDeleteRecipes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => RecipeService.deleteRecipes(ids),
    
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.recipes });
      
      const previousRecipes = queryClient.getQueryData<Recipe[]>(QUERY_KEYS.recipes);
      const deletedRecipes = previousRecipes?.filter(recipe => ids.includes(recipe.id)) || [];
      
      // レシピリストから一括削除
      queryClient.setQueryData<Recipe[]>(QUERY_KEYS.recipes, (old) =>
        old?.filter(recipe => !ids.includes(recipe.id)) || []
      );
      
      // 個別キャッシュも削除
      ids.forEach(id => {
        queryClient.removeQueries({ queryKey: QUERY_KEYS.recipe(id) });
      });
      
      return { previousRecipes, deletedRecipes };
    },
    
    onSuccess: (_result, deletedIds) => {
      // 成功時：関連キャッシュを無効化
      deletedIds.forEach((id: string) => cacheUtils.removeRecipeFromCache(id));
      cacheUtils.invalidateStats();
    },
    
    onError: (error, _ids, context) => {
      // エラー時：削除したレシピを復元
      if (context?.previousRecipes) {
        queryClient.setQueryData(QUERY_KEYS.recipes, context.previousRecipes);
      }
      
      console.error('レシピ一括削除エラー:', error);
    },
  });
};

// 調理回数増加のミューテーション
export const useIncrementCookCount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => RecipeService.incrementCookCount(id),
    
    onMutate: async (id) => {
      // 楽観的更新
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.recipe(id) });
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.recipes });
      
      const previousRecipe = queryClient.getQueryData<Recipe>(QUERY_KEYS.recipe(id));
      const previousRecipes = queryClient.getQueryData<Recipe[]>(QUERY_KEYS.recipes);
      
      if (previousRecipe) {
        const updatedRecipe = {
          ...previousRecipe,
          cookCount: previousRecipe.cookCount + 1,
          lastCooked: new Date().toISOString(),
        };
        
        // キャッシュを更新
        queryClient.setQueryData(QUERY_KEYS.recipe(id), updatedRecipe);
        queryClient.setQueryData<Recipe[]>(QUERY_KEYS.recipes, (old) =>
          old?.map(recipe => recipe.id === id ? updatedRecipe : recipe) || []
        );
      }
      
      return { previousRecipe, previousRecipes };
    },
    
    onSuccess: (updatedRecipe) => {
      // 成功時：最新データでキャッシュを更新
      cacheUtils.setRecipeCache(updatedRecipe);
      cacheUtils.invalidateStats();
      
      // 人気レシピと最近調理したレシピのキャッシュも無効化
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.popularRecipes });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.recentRecipes });
    },
    
    onError: (error, id, context) => {
      // エラー時：ロールバック
      if (context?.previousRecipe) {
        queryClient.setQueryData(QUERY_KEYS.recipe(id), context.previousRecipe);
      }
      if (context?.previousRecipes) {
        queryClient.setQueryData(QUERY_KEYS.recipes, context.previousRecipes);
      }
      
      console.error('調理回数更新エラー:', error);
    },
  });
};

// データエクスポートのミューテーション
export const useExportData = () => {
  return useMutation({
    mutationFn: RecipeService.exportData,
    
    onSuccess: (data) => {
      // エクスポートしたデータをダウンロード
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `recipes-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    
    onError: (error) => {
      console.error('データエクスポートエラー:', error);
    },
  });
};

// データインポートのミューテーション
export const useImportData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recipes: Recipe[]) => RecipeService.importData(recipes),
    
    onSuccess: () => {
      // インポート成功時：全キャッシュを無効化して再取得
      queryClient.invalidateQueries();
    },
    
    onError: (error) => {
      console.error('データインポートエラー:', error);
    },
  });
};

// データベースクリアのミューテーション（開発用）
export const useClearDatabase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: RecipeService.clearDatabase,
    
    onSuccess: () => {
      // クリア成功時：全キャッシュをクリア
      queryClient.clear();
    },
    
    onError: (error) => {
      console.error('データベースクリアエラー:', error);
    },
  });
};

// エラーハンドリング用のフック
export const useErrorHandler = () => {
  return {
    getErrorMessage: errorUtils.getErrorMessage,
    getUserFriendlyMessage: errorUtils.getUserFriendlyMessage,
    
    // エラーをトーストで表示する関数（実装は後で）
    showError: (error: unknown) => {
      const message = errorUtils.getUserFriendlyMessage(error);
      console.error('Error:', message);
      // TODO: トースト通知の実装
    },
    
    // 成功メッセージを表示する関数（実装は後で）
    showSuccess: (message: string) => {
      console.log('Success:', message);
      // TODO: トースト通知の実装
    },
  };
};

// 統合されたレシピ管理フック（全機能をまとめたもの）
export const useRecipeManager = () => {
  const recipesQuery = useRecipes();
  const statsQuery = useStats();
  const addRecipeMutation = useAddRecipe();
  const updateRecipeMutation = useUpdateRecipe();
  const deleteRecipeMutation = useDeleteRecipe();
  const incrementCookCountMutation = useIncrementCookCount();
  const errorHandler = useErrorHandler();

  return {
    // データ
    recipes: recipesQuery.data || [],
    stats: statsQuery.data,
    
    // ローディング状態
    isLoading: recipesQuery.isLoading || statsQuery.isLoading,
    isError: recipesQuery.isError || statsQuery.isError,
    error: recipesQuery.error || statsQuery.error,
    
    // ミューテーション状態
    isAdding: addRecipeMutation.isPending,
    isUpdating: updateRecipeMutation.isPending,
    isDeleting: deleteRecipeMutation.isPending,
    
    // アクション
    addRecipe: addRecipeMutation.mutate,
    updateRecipe: (id: string, updates: Partial<Recipe>) =>
      updateRecipeMutation.mutate({ id, updates }),
    deleteRecipe: deleteRecipeMutation.mutate,
    incrementCookCount: incrementCookCountMutation.mutate,
    
    // エラーハンドリング
    ...errorHandler,
    
    // キャッシュ操作
    refetch: () => {
      recipesQuery.refetch();
      statsQuery.refetch();
    },
    
    // 楽観的更新の手動実行
    optimisticUpdate: (id: string, updates: Partial<Recipe>) => {
      updateRecipeMutation.mutate({ id, updates });
    },
  };
};