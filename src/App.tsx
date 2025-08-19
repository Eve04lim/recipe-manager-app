import { Download, Edit3, Heart, Plus, Trash2, Upload } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { CookingSteps } from './components/recipe/CookingSteps';
import { IngredientList } from './components/recipe/IngredientList';
import { RecipeCard } from './components/recipe/RecipeCard';
import { RecipeFilterPanel } from './components/recipe/RecipeFilterPanel';
import { RecipeForm } from './components/recipe/RecipeForm';
import { RecipeSearchBar } from './components/recipe/RecipeSearchBar';
import { RecipeSortControls } from './components/recipe/RecipeSortControls';
import { Button } from './components/ui/Button';
import { Modal } from './components/ui/Modal';
import { useRecipeFilter } from './hooks/useRecipeFilter';
import {
  useAddRecipe,
  useClearDatabase,
  useDeleteRecipe,
  useExportData,
  useImportData,
  useIncrementCookCount,
  useRecipes,
  useStats,
  useUpdateRecipe
} from './hooks/useRecipes';
import type { Recipe } from './types';
import { initializeSampleData } from './utils/sampleData';

// ローディングスピナーコンポーネント
const LoadingSpinner: React.FC<{ message?: string }> = ({ message = "読み込み中..." }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

// エラー表示コンポーネント
const ErrorDisplay: React.FC<{ error: unknown; onRetry: () => void }> = ({ error, onRetry }) => {
  const errorMessage = error instanceof Error ? error.message : '予期しないエラーが発生しました';
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">😵</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            データの読み込みエラー
          </h2>
          <p className="text-gray-600 mb-4">{errorMessage}</p>
          
          {/* デバッグ情報（開発モード） */}
          {typeof process !== 'undefined' && process.env?.NODE_ENV === 'development' && (
            <details className="mb-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                🔧 デバッグ情報を表示
              </summary>
              <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                <pre className="whitespace-pre-wrap">{JSON.stringify(error, null, 2)}</pre>
              </div>
            </details>
          )}
          
          <div className="flex gap-3 justify-center">
            <Button onClick={onRetry} variant="primary">
              再試行
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              ページを再読み込み
            </Button>
            
            {/* 開発モード用のリセットボタン */}
            {typeof process !== 'undefined' && process.env?.NODE_ENV === 'development' && (
              <Button 
                onClick={() => {
                  // IndexedDBを強制クリア
                  indexedDB.deleteDatabase('RecipeManagerDB')
                    .then(() => {
                      console.log('🗑️ データベースをクリアしました');
                      window.location.reload();
                    })
                    .catch(console.error);
                }}
                variant="danger"
                size="sm"
              >
                DB完全リセット
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 通知システム（簡易版）
const useNotification = () => {
  const showSuccess = (message: string) => {
    // 実際のアプリではtoast libraryを使用
    console.log('✅ Success:', message);
    alert(`✅ ${message}`);
  };

  const showError = (error: unknown) => {
    const message = error instanceof Error ? error.message : '操作に失敗しました';
    console.error('❌ Error:', error);
    alert(`❌ ${message}`);
  };

  return { showSuccess, showError };
};

function App() {
  // React Query フック
  const recipesQuery = useRecipes();
  const statsQuery = useStats();
  const addRecipeMutation = useAddRecipe();
  const updateRecipeMutation = useUpdateRecipe();
  const deleteRecipeMutation = useDeleteRecipe();
  const incrementCookCountMutation = useIncrementCookCount();
  const exportDataMutation = useExportData();
  const importDataMutation = useImportData();
  const clearDatabaseMutation = useClearDatabase();

  // 通知システム
  const { showSuccess, showError } = useNotification();

  // ローカル状態
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [currentServings, setCurrentServings] = useState(4);
  const [showFilters, setShowFilters] = useState(false);

  // データの取得
  const recipes = recipesQuery.data || [];
  const stats = statsQuery.data;

  // 検索・フィルタフック
  const {
    searchQuery,
    filters,
    sort,
    filteredRecipes,
    stats: filterStats,
    updateSearchQuery,
    updateFilter,
    updateSort,
    resetFilters,
  } = useRecipeFilter(recipes);

  // 利用可能なタグを取得
  const availableTags = [...new Set(recipes.flatMap(recipe => recipe.tags))];

  // アプリ初期化時にデータベースとサンプルデータを読み込み
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // まずデータベースを初期化
        console.log('🚀 アプリケーションの初期化を開始...');
        
        const { RecipeService } = await import('./lib/database');
        await RecipeService.initializeDatabase();
        
        console.log('✅ データベースの初期化完了');
        
        // レシピデータを強制的に再取得
        recipesQuery.refetch();
        
      } catch (error) {
        console.error('❌ アプリケーションの初期化に失敗:', error);
      }
    };

    // アプリ起動時に一度だけ実行
    initializeApp();
  }, []); // 依存配列を空にして初回のみ実行

  // データが正常に読み込まれ、レシピが0件の場合のみサンプルデータを初期化
  useEffect(() => {
    if (recipesQuery.isSuccess && recipes.length === 0 && !recipesQuery.isFetching) {
      console.log('📚 レシピが0件のため、サンプルデータを初期化します');
      initializeSampleData()
        .then(() => {
          console.log('✅ サンプルデータの初期化完了');
          // データを再取得
          recipesQuery.refetch();
        })
        .catch((error) => {
          console.error('❌ サンプルデータの初期化に失敗:', error);
        });
    }
  }, [recipesQuery.isSuccess, recipes.length, recipesQuery.isFetching, recipesQuery.refetch]);

  // レシピの保存（新規作成・編集）
  const handleSaveRecipe = async (recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'cookCount' | 'lastCooked'>) => {
    try {
      if (editingRecipe) {
        // 編集の場合
        await updateRecipeMutation.mutateAsync({ 
          id: editingRecipe.id, 
          updates: recipeData 
        });
        showSuccess('レシピを更新しました');
      } else {
        // 新規作成の場合
        await addRecipeMutation.mutateAsync(recipeData);
        showSuccess('レシピを作成しました');
      }
      
      // モーダルを閉じる
      setIsFormModalOpen(false);
      setEditingRecipe(null);
    } catch (error) {
      showError(error);
    }
  };

  // フォームのキャンセル
  const handleCancelForm = () => {
    setIsFormModalOpen(false);
    setEditingRecipe(null);
  };

  // 新規レシピ作成
  const handleCreateRecipe = () => {
    setEditingRecipe(null);
    setIsFormModalOpen(true);
  };

  // レシピ編集
  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setIsFormModalOpen(true);
  };

  // お気に入りの切り替え
  const handleToggleFavorite = async (recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    try {
      await updateRecipeMutation.mutateAsync({
        id: recipeId,
        updates: { isFavorite: !recipe.isFavorite }
      });
      showSuccess(recipe.isFavorite ? 'お気に入りから削除しました' : 'お気に入りに追加しました');
    } catch (error) {
      showError(error);
    }
  };

  // レシピの詳細表示
  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setCurrentServings(recipe.servings);
    setIsDetailModalOpen(true);
  };

  // レシピの削除
  const handleDeleteRecipe = async (recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    if (confirm(`「${recipe.title}」を削除してもよろしいですか？`)) {
      try {
        await deleteRecipeMutation.mutateAsync(recipeId);
        showSuccess('レシピを削除しました');
      } catch (error) {
        showError(error);
      }
    }
  };

  // 調理完了の処理
  const handleCookingComplete = async (recipeId: string) => {
    try {
      await incrementCookCountMutation.mutateAsync(recipeId);
      showSuccess('調理完了！調理回数を更新しました');
    } catch (error) {
      showError(error);
    }
  };

  // データエクスポート
  const handleExportData = async () => {
    try {
      await exportDataMutation.mutateAsync();
      showSuccess('データをエクスポートしました');
    } catch (error) {
      showError(error);
    }
  };

  // データインポート
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (Array.isArray(data)) {
          await importDataMutation.mutateAsync(data);
          showSuccess('データをインポートしました');
        } else {
          showError(new Error('無効なデータ形式です'));
        }
      } catch {
        showError(new Error('ファイルの読み込みに失敗しました'));
      }
    };
    reader.readAsText(file);
    
    // ファイル入力をリセット
    event.target.value = '';
  };

  // データベースクリア（開発用）
  const handleClearDatabase = async () => {
    if (confirm('全てのデータを削除してもよろしいですか？この操作は取り消せません。')) {
      try {
        await clearDatabaseMutation.mutateAsync();
        showSuccess('データベースをクリアしました');
      } catch (error) {
        showError(error);
      }
    }
  };

  // ローディング状態
  if (recipesQuery.isLoading) {
    return <LoadingSpinner message="レシピデータを読み込み中..." />;
  }

  // エラー状態
  if (recipesQuery.isError) {
    return <ErrorDisplay error={recipesQuery.error} onRetry={() => recipesQuery.refetch()} />;
  }

  // 現在進行中の操作があるかどうか
  const isAnyMutationPending = 
    addRecipeMutation.isPending ||
    updateRecipeMutation.isPending ||
    deleteRecipeMutation.isPending ||
    incrementCookCountMutation.isPending ||
    exportDataMutation.isPending ||
    importDataMutation.isPending ||
    clearDatabaseMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-800 mb-4">
            🍳 レシピ管理アプリ
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            美味しいレシピを作成・管理しよう！データベース統合版
          </p>
          
          {/* アクションボタン */}
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            <Button 
              leftIcon={<Plus />} 
              size="lg"
              onClick={handleCreateRecipe}
              disabled={isAnyMutationPending}
            >
              新しいレシピを作成
            </Button>
            
            <Button
              variant="outline"
              leftIcon={<Download />}
              onClick={handleExportData}
              disabled={isAnyMutationPending}
            >
              データエクスポート
            </Button>
            
            <label className="inline-block cursor-pointer">
              <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                <Upload className="w-4 h-4 mr-2" />
                {importDataMutation.isPending ? '読み込み中...' : 'データインポート'}
              </span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                disabled={isAnyMutationPending}
                className="hidden"
              />
            </label>
            
            {/* 開発モードでのみ表示 */}
            {typeof process !== 'undefined' && process.env?.NODE_ENV === 'development' && (
              <Button
                variant="danger"
                leftIcon={<Trash2 />}
                onClick={handleClearDatabase}
                disabled={isAnyMutationPending}
                size="sm"
              >
                DB クリア
              </Button>
            )}
          </div>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-md text-center">
            <div className="text-2xl font-bold text-primary-600">
              {stats?.totalRecipes || 0}
            </div>
            <div className="text-sm text-gray-600">総レシピ数</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md text-center">
            <div className="text-2xl font-bold text-red-500">
              {stats?.favoriteRecipes || 0}
            </div>
            <div className="text-sm text-gray-600">お気に入り</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md text-center">
            <div className="text-2xl font-bold text-green-500">
              {Object.keys(stats?.categoryBreakdown || {}).length}
            </div>
            <div className="text-sm text-gray-600">カテゴリ数</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md text-center">
            <div className="text-2xl font-bold text-blue-500">
              ⭐ {stats?.avgRating || 0}
            </div>
            <div className="text-sm text-gray-600">平均評価</div>
          </div>
        </div>

        {/* 進行中の操作インジケーター */}
        {isAnyMutationPending && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-blue-700 text-sm">
                {addRecipeMutation.isPending && 'レシピを作成中...'}
                {updateRecipeMutation.isPending && 'レシピを更新中...'}
                {deleteRecipeMutation.isPending && 'レシピを削除中...'}
                {incrementCookCountMutation.isPending && '調理回数を更新中...'}
                {exportDataMutation.isPending && 'データをエクスポート中...'}
                {importDataMutation.isPending && 'データをインポート中...'}
                {clearDatabaseMutation.isPending && 'データベースをクリア中...'}
              </span>
            </div>
          </div>
        )}

        {/* 検索・フィルタエリア */}
        <div className="mb-8 space-y-4">
          <RecipeSearchBar
            searchQuery={searchQuery}
            onSearchChange={updateSearchQuery}
            onFilterToggle={() => setShowFilters(!showFilters)}
            showFilters={showFilters}
            resultCount={filterStats.filteredCount}
            totalCount={filterStats.totalRecipes}
            onReset={resetFilters}
          />

          <RecipeFilterPanel
            filters={filters}
            onFilterChange={updateFilter}
            onReset={resetFilters}
            availableTags={availableTags}
            isVisible={showFilters}
          />
        </div>

        {/* ソートコントロール */}
        {filterStats.filteredCount > 0 && (
          <div className="mb-6">
            <RecipeSortControls
              sort={sort}
              onSortChange={updateSort}
              resultCount={filterStats.filteredCount}
            />
          </div>
        )}

        {/* レシピ一覧 */}
        <div className="mb-12">
          {filterStats.filteredCount > 0 ? (
            <div className="recipe-grid">
              {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onView={handleViewRecipe}
                  onEdit={handleEditRecipe}
                  onDelete={handleDeleteRecipe}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">
                {searchQuery || Object.values(filters).some(v => v && (Array.isArray(v) ? v.length > 0 : true)) 
                  ? '🔍' 
                  : '📚'
                }
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {recipes.length === 0 
                  ? 'まだレシピがありません' 
                  : 'レシピが見つかりませんでした'
                }
              </h3>
              <p className="text-gray-600 mb-6">
                {recipes.length === 0 
                  ? '最初のレシピを作成して、美味しい料理のコレクションを始めましょう！'
                  : '検索条件を変更するか、新しいレシピを追加してみてください。'
                }
              </p>
              <div className="flex justify-center gap-3">
                {recipes.length > 0 && (
                  <Button variant="outline" onClick={resetFilters}>
                    フィルタをリセット
                  </Button>
                )}
                <Button leftIcon={<Plus />} onClick={handleCreateRecipe}>
                  新しいレシピを作成
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* レシピフォームモーダル */}
        <Modal
          isOpen={isFormModalOpen}
          onClose={handleCancelForm}
          title={editingRecipe ? 'レシピを編集' : '新しいレシピを作成'}
          size="xl"
        >
          <RecipeForm
            recipe={editingRecipe || undefined}
            onSave={handleSaveRecipe}
            onCancel={handleCancelForm}
            isLoading={addRecipeMutation.isPending || updateRecipeMutation.isPending}
          />
        </Modal>

        {/* レシピ詳細モーダル */}
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={selectedRecipe?.title}
          size="xl"
        >
          {selectedRecipe && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="aspect-recipe">
                  <img
                    src={selectedRecipe.imageUrl}
                    alt={selectedRecipe.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                
                <div className="space-y-4">
                  <p className="text-gray-600">{selectedRecipe.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">調理時間:</span>
                      <span>{selectedRecipe.prepTime + selectedRecipe.cookTime}分</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">人数:</span>
                      <span>{selectedRecipe.servings}人分</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">難易度:</span>
                      <span>⭐ × {selectedRecipe.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">調理回数:</span>
                      <span>{selectedRecipe.cookCount}回</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedRecipe.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      variant={selectedRecipe.isFavorite ? "danger" : "outline"}
                      leftIcon={<Heart />}
                      onClick={() => handleToggleFavorite(selectedRecipe.id)}
                      disabled={updateRecipeMutation.isPending}
                    >
                      {selectedRecipe.isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
                    </Button>
                    <Button
                      variant="secondary"
                      leftIcon={<Edit3 />}
                      onClick={() => {
                        setIsDetailModalOpen(false);
                        handleEditRecipe(selectedRecipe);
                      }}
                      disabled={isAnyMutationPending}
                    >
                      編集
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => handleCookingComplete(selectedRecipe.id)}
                      disabled={incrementCookCountMutation.isPending}
                    >
                      調理完了
                    </Button>
                  </div>
                </div>
              </div>

              <IngredientList
                ingredients={selectedRecipe.ingredients}
                servings={currentServings}
                onServingsChange={setCurrentServings}
              />

              <CookingSteps steps={selectedRecipe.steps} />
            </div>
          )}
        </Modal>

        {/* フッター情報 */}
        <div className="mt-16 text-center text-sm text-gray-500 border-t border-gray-200 pt-8">
          <p>
            React Query + IndexedDB を使用したレシピ管理アプリ
          </p>
          {typeof process !== 'undefined' && process.env?.NODE_ENV === 'development' && (
            <div className="mt-4 space-y-2">
              <p className="mt-2">
                🔧 開発モード: console で <code>window.recipeDebug</code> を確認してください
              </p>
              <div className="flex justify-center gap-4 text-xs">
                <button 
                  onClick={async () => {
                    try {
                      const { RecipeService } = await import('./lib/database');
                      const status = await RecipeService.getDatabaseStatus();
                      console.log('📊 データベース状態:', status);
                      alert(JSON.stringify(status, null, 2));
                    } catch (error) {
                      console.error('データベース状態の取得に失敗:', error);
                      alert('データベース状態の取得に失敗しました');
                    }
                  }}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                >
                  DB状態確認
                </button>
                <button 
                  onClick={async () => {
                    try {
                      const { RecipeService } = await import('./lib/database');
                      const validation = await RecipeService.validateDatabase();
                      console.log('🔍 整合性チェック結果:', validation);
                      alert(`整合性: ${validation.isValid ? 'OK' : 'NG'}\nエラー数: ${validation.errors.length}`);
                    } catch (error) {
                      console.error('整合性チェックに失敗:', error);
                      alert('整合性チェックに失敗しました');
                    }
                  }}
                  className="px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                >
                  整合性チェック
                </button>
                <button 
                  onClick={async () => {
                    if (confirm('データベースを完全に再作成しますか？（データは保持されます）')) {
                      try {
                        const { RecipeService } = await import('./lib/database');
                        await RecipeService.recreateDatabase();
                        alert('データベースの再作成が完了しました');
                        window.location.reload();
                      } catch (error) {
                        console.error('データベース再作成に失敗:', error);
                        alert('データベース再作成に失敗しました');
                      }
                    }
                  }}
                  className="px-2 py-1 bg-orange-100 text-orange-800 rounded hover:bg-orange-200"
                >
                  DB再作成
                </button>
                <button 
                  onClick={async () => {
                    if (confirm('データベースを完全に削除して最初からやり直しますか？')) {
                      try {
                        const deleteRequest = indexedDB.deleteDatabase('RecipeManagerDB');
                        deleteRequest.onsuccess = () => {
                          alert('データベースを削除しました。ページをリロードします。');
                          window.location.reload();
                        };
                        deleteRequest.onerror = () => {
                          alert('データベース削除に失敗しました');
                        };
                      } catch {
                        alert('データベース削除に失敗しました');
                      }
                    }
                  }}
                  className="px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
                >
                  完全リセット
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;