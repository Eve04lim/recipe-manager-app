import { Heart, Plus } from 'lucide-react';
import { useState } from 'react';
import { CookingSteps } from './components/recipe/CookingSteps';
import { IngredientList } from './components/recipe/IngredientList';
import { RecipeCard } from './components/recipe/RecipeCard';
import { RecipeFilterPanel } from './components/recipe/RecipeFilterPanel';
import { RecipeSearchBar } from './components/recipe/RecipeSearchBar';
import { RecipeSortControls } from './components/recipe/RecipeSortControls';
import { Button } from './components/ui/Button';
import { Modal } from './components/ui/Modal';
import { useRecipeFilter } from './hooks/useRecipeFilter';
import type { Recipe } from './types';

// 拡張サンプルデータ
const sampleRecipes: Recipe[] = [
  // 前回のサンプルレシピに加えて、追加のレシピ
  {
    id: '4',
    title: 'パスタアラビアータ',
    description: 'ピリ辛のトマトソースが絶品のパスタです。',
    servings: 2,
    prepTime: 10,
    cookTime: 15,
    difficulty: 2,
    category: 'イタリアン',
    ingredients: [
      { id: 'ing18', name: 'パスタ', amount: 200, unit: 'g' },
      { id: 'ing19', name: 'ホールトマト', amount: 1, unit: '缶' },
      { id: 'ing20', name: 'にんにく', amount: 2, unit: '片', notes: 'みじん切り' },
      { id: 'ing21', name: 'オリーブオイル', amount: 3, unit: '大さじ' },
      { id: 'ing22', name: '唐辛子', amount: 1, unit: '本' },
    ],
    steps: [
      { id: 'step14', stepNumber: 1, description: 'パスタを茹でる準備をします。' },
      { id: 'step15', stepNumber: 2, description: 'にんにくと唐辛子をオリーブオイルで炒めます。', timer: 3 },
      { id: 'step16', stepNumber: 3, description: 'トマトソースを加えて煮込みます。', timer: 10 },
      { id: 'step17', stepNumber: 4, description: '茹でたパスタと絡めて完成です。' },
    ],
    tags: ['イタリアン', 'パスタ', 'ピリ辛', '簡単'],
    imageUrl: 'https://via.placeholder.com/400x300/dc2626/ffffff?text=🍝+パスタ',
    isFavorite: true,
    rating: 4.7,
    createdAt: '2024-01-12T18:00:00Z',
    updatedAt: '2024-01-12T18:00:00Z',
    cookCount: 5
  },
  {
    id: '5',
    title: '味噌ラーメン',
    description: '濃厚な味噌スープが自慢のラーメンです。寒い日にぴったりの一品。',
   servings: 2,
   prepTime: 15,
   cookTime: 25,
   difficulty: 3,
   category: '和食',
   ingredients: [
     { id: 'ing23', name: '中華麺', amount: 2, unit: '玉' },
     { id: 'ing24', name: '味噌', amount: 4, unit: '大さじ' },
     { id: 'ing25', name: '鶏がらスープの素', amount: 2, unit: '小さじ' },
     { id: 'ing26', name: 'もやし', amount: 1, unit: '袋' },
     { id: 'ing27', name: 'チャーシュー', amount: 4, unit: '枚' },
     { id: 'ing28', name: 'ねぎ', amount: 2, unit: '本', notes: '小口切り' },
     { id: 'ing29', name: 'ゆで卵', amount: 2, unit: '個' },
   ],
   steps: [
     { id: 'step18', stepNumber: 1, description: 'スープを作ります。味噌と鶏がらスープの素を合わせます。' },
     { id: 'step19', stepNumber: 2, description: 'もやしを茹でて準備します。', timer: 3 },
     { id: 'step20', stepNumber: 3, description: '中華麺を茹でます。', timer: 3 },
     { id: 'step21', stepNumber: 4, description: '器にスープと麺を入れ、具材をトッピングして完成です。' },
   ],
   tags: ['和食', 'ラーメン', '温かい', '冬'],
   imageUrl: 'https://via.placeholder.com/400x300/f59e0b/ffffff?text=🍜+ラーメン',
   isFavorite: false,
   rating: 4.3,
   createdAt: '2024-01-11T12:00:00Z',
   updatedAt: '2024-01-11T12:00:00Z',
   cookCount: 2
 },
 {
   id: '6',
   title: 'フルーツタルト',
   description: 'カラフルなフルーツが美しいタルトです。見た目も味も最高！',
   servings: 6,
   prepTime: 45,
   cookTime: 30,
   difficulty: 5,
   category: 'デザート',
   ingredients: [
     { id: 'ing30', name: 'タルト生地', amount: 1, unit: '枚' },
     { id: 'ing31', name: 'カスタードクリーム', amount: 200, unit: 'ml' },
     { id: 'ing32', name: 'いちご', amount: 10, unit: '個' },
     { id: 'ing33', name: 'キウイ', amount: 2, unit: '個' },
     { id: 'ing34', name: 'ブルーベリー', amount: 50, unit: 'g' },
     { id: 'ing35', name: 'ナパージュ', amount: 2, unit: '大さじ' },
   ],
   steps: [
     { id: 'step22', stepNumber: 1, description: 'タルト生地を焼きます。', timer: 20 },
     { id: 'step23', stepNumber: 2, description: 'カスタードクリームを作ります。', timer: 15 },
     { id: 'step24', stepNumber: 3, description: 'フルーツをカットして準備します。', timer: 10 },
     { id: 'step25', stepNumber: 4, description: 'タルト生地にクリームを敷き、フルーツを美しく並べます。' },
     { id: 'step26', stepNumber: 5, description: 'ナパージュを塗って完成です。' },
   ],
   tags: ['デザート', 'タルト', 'フルーツ', '手作り', '特別な日'],
   imageUrl: 'https://via.placeholder.com/400x300/ec4899/ffffff?text=🥧+タルト',
   isFavorite: true,
   rating: 4.9,
   createdAt: '2024-01-10T14:30:00Z',
   updatedAt: '2024-01-10T14:30:00Z',
   cookCount: 1
 },
 {
   id: '7',
   title: '親子丼',
   description: 'ふわふわ卵と鶏肉の定番丼ぶりです。家庭の味を再現。',
   servings: 2,
   prepTime: 10,
   cookTime: 15,
   difficulty: 2,
   category: '和食',
   ingredients: [
     { id: 'ing36', name: '鶏もも肉', amount: 200, unit: 'g', notes: '一口大に切る' },
     { id: 'ing37', name: '卵', amount: 4, unit: '個' },
     { id: 'ing38', name: '玉ねぎ', amount: 1, unit: '個', notes: 'スライス' },
     { id: 'ing39', name: 'ご飯', amount: 2, unit: '膳' },
     { id: 'ing40', name: 'だし汁', amount: 200, unit: 'ml' },
     { id: 'ing41', name: '醤油', amount: 2, unit: '大さじ' },
     { id: 'ing42', name: 'みりん', amount: 1, unit: '大さじ' },
   ],
   steps: [
     { id: 'step27', stepNumber: 1, description: 'だし汁、醤油、みりんを煮立てます。' },
     { id: 'step28', stepNumber: 2, description: '鶏肉と玉ねぎを加えて煮ます。', timer: 8 },
     { id: 'step29', stepNumber: 3, description: '溶き卵を回し入れ、半熟で火を止めます。', timer: 2 },
     { id: 'step30', stepNumber: 4, description: 'ご飯の上にのせて完成です。' },
   ],
   tags: ['和食', '丼ぶり', '卵', '鶏肉', '家庭料理'],
   imageUrl: 'https://via.placeholder.com/400x300/f59e0b/ffffff?text=🍚+親子丼',
   isFavorite: false,
   rating: 4.4,
   createdAt: '2024-01-09T19:00:00Z',
   updatedAt: '2024-01-09T19:00:00Z',
   cookCount: 7
 },
 {
   id: '8',
   title: 'グリーンスムージー',
   description: 'ヘルシーで栄養満点のグリーンスムージーです。朝食にぴったり！',
   servings: 2,
   prepTime: 5,
   cookTime: 0,
   difficulty: 1,
   category: '飲み物',
   ingredients: [
     { id: 'ing43', name: 'ほうれん草', amount: 50, unit: 'g' },
     { id: 'ing44', name: 'バナナ', amount: 1, unit: '本' },
     { id: 'ing45', name: 'りんご', amount: 1, unit: '個' },
     { id: 'ing46', name: '水', amount: 200, unit: 'ml' },
     { id: 'ing47', name: 'はちみつ', amount: 1, unit: '大さじ' },
   ],
   steps: [
     { id: 'step31', stepNumber: 1, description: 'フルーツと野菜をカットします。' },
     { id: 'step32', stepNumber: 2, description: 'すべての材料をミキサーに入れて撹拌します。', timer: 2 },
     { id: 'step33', stepNumber: 3, description: 'グラスに注いで完成です。' },
   ],
   tags: ['ヘルシー', 'スムージー', '朝食', '野菜', 'フルーツ'],
   isFavorite: true,
   rating: 4.1,
   createdAt: '2024-01-08T07:00:00Z',
   updatedAt: '2024-01-08T07:00:00Z',
   cookCount: 15
 }
];

function App() {
 const [recipes, setRecipes] = useState<Recipe[]>(sampleRecipes);
 const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
 const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
 const [currentServings, setCurrentServings] = useState(4);
 const [showFilters, setShowFilters] = useState(false);

 // 検索・フィルタフック
 const {
   searchQuery,
   filters,
   sort,
   filteredRecipes,
   stats,
   updateSearchQuery,
   updateFilter,
   updateSort,
   resetFilters,
 } = useRecipeFilter(recipes);

 // 利用可能なタグを取得
 const availableTags = [...new Set(recipes.flatMap(recipe => recipe.tags))];

 // お気に入りの切り替え
 const handleToggleFavorite = (recipeId: string) => {
   setRecipes(prev => prev.map(recipe => 
     recipe.id === recipeId 
       ? { ...recipe, isFavorite: !recipe.isFavorite }
       : recipe
   ));
 };

 // レシピの詳細表示
 const handleViewRecipe = (recipe: Recipe) => {
   setSelectedRecipe(recipe);
   setCurrentServings(recipe.servings);
   setIsDetailModalOpen(true);
 };

 // レシピの削除
 const handleDeleteRecipe = (recipeId: string) => {
   if (confirm('このレシピを削除してもよろしいですか？')) {
     setRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));
   }
 };

 // レシピの編集
 const handleEditRecipe = (recipe: Recipe) => {
   alert(`「${recipe.title}」の編集機能は次回実装予定です！`);
 };

 return (
   <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
     <div className="container mx-auto px-4 py-8">
       {/* ヘッダー */}
       <div className="text-center mb-8">
         <h1 className="text-4xl font-bold text-primary-800 mb-4">
           🍳 レシピ管理アプリ
         </h1>
         <p className="text-lg text-gray-600 mb-6">
           美味しいレシピを検索・管理しよう！
         </p>
         <Button leftIcon={<Plus />} size="lg">
           新しいレシピを追加
         </Button>
       </div>

       {/* 統計情報 */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
         <div className="bg-white rounded-lg p-4 shadow-md text-center">
           <div className="text-2xl font-bold text-primary-600">
             {stats.totalRecipes}
           </div>
           <div className="text-sm text-gray-600">総レシピ数</div>
         </div>
         <div className="bg-white rounded-lg p-4 shadow-md text-center">
           <div className="text-2xl font-bold text-red-500">
             {stats.favoriteCount}
           </div>
           <div className="text-sm text-gray-600">お気に入り</div>
         </div>
         <div className="bg-white rounded-lg p-4 shadow-md text-center">
           <div className="text-2xl font-bold text-green-500">
             {stats.categories.length}
           </div>
           <div className="text-sm text-gray-600">カテゴリ数</div>
         </div>
         <div className="bg-white rounded-lg p-4 shadow-md text-center">
           <div className="text-2xl font-bold text-blue-500">
             ⭐ {stats.avgRating}
           </div>
           <div className="text-sm text-gray-600">平均評価</div>
         </div>
       </div>

       {/* 検索・フィルタエリア */}
       <div className="mb-8 space-y-4">
         {/* 検索バー */}
         <RecipeSearchBar
           searchQuery={searchQuery}
           onSearchChange={updateSearchQuery}
           onFilterToggle={() => setShowFilters(!showFilters)}
           showFilters={showFilters}
           resultCount={stats.filteredCount}
           totalCount={stats.totalRecipes}
           onReset={resetFilters}
         />

         {/* フィルタパネル */}
         <RecipeFilterPanel
           filters={filters}
           onFilterChange={updateFilter}
           onReset={resetFilters}
           availableTags={availableTags}
           isVisible={showFilters}
         />
       </div>

       {/* ソートコントロール */}
       {stats.filteredCount > 0 && (
         <div className="mb-6">
           <RecipeSortControls
             sort={sort}
             onSortChange={updateSort}
             resultCount={stats.filteredCount}
           />
         </div>
       )}

       {/* レシピ一覧 */}
       <div className="mb-12">
         {stats.filteredCount > 0 ? (
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
             <div className="text-6xl mb-4">🔍</div>
             <h3 className="text-xl font-semibold text-gray-800 mb-2">
               レシピが見つかりませんでした
             </h3>
             <p className="text-gray-600 mb-6">
               検索条件を変更するか、新しいレシピを追加してみてください。
             </p>
             <div className="flex justify-center gap-3">
               <Button variant="outline" onClick={resetFilters}>
                 フィルタをリセット
               </Button>
               <Button leftIcon={<Plus />}>
                 新しいレシピを追加
               </Button>
             </div>
           </div>
         )}
       </div>

       {/* レシピ詳細モーダル */}
       <Modal
         isOpen={isDetailModalOpen}
         onClose={() => setIsDetailModalOpen(false)}
         title={selectedRecipe?.title}
         size="xl"
       >
         {selectedRecipe && (
           <div className="space-y-8">
             {/* レシピ基本情報 */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* 画像 */}
               <div className="aspect-recipe">
                 <img
                   src={selectedRecipe.imageUrl}
                   alt={selectedRecipe.title}
                   className="w-full h-full object-cover rounded-lg"
                 />
               </div>
               
               {/* 詳細情報 */}
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
                     <span className="font-medium">カテゴリ:</span>
                     <span>{selectedRecipe.category}</span>
                   </div>
                 </div>

                 {/* タグ */}
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

                 {/* アクションボタン */}
                 <div className="flex gap-2 pt-4">
                   <Button
                     variant={selectedRecipe.isFavorite ? "danger" : "outline"}
                     leftIcon={<Heart />}
                     onClick={() => handleToggleFavorite(selectedRecipe.id)}
                   >
                     {selectedRecipe.isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
                   </Button>
                   <Button
                     variant="secondary"
                     onClick={() => handleEditRecipe(selectedRecipe)}
                   >
                     編集
                   </Button>
                 </div>
               </div>
             </div>

             {/* 材料リスト */}
             <IngredientList
               ingredients={selectedRecipe.ingredients}
               servings={currentServings}
               onServingsChange={setCurrentServings}
             />

             {/* 調理手順 */}
             <CookingSteps steps={selectedRecipe.steps} />
           </div>
         )}
       </Modal>
     </div>
   </div>
 );
}

export default App;