import { Heart, Plus } from 'lucide-react';
import { useState } from 'react';
import { CookingSteps } from './components/recipe/CookingSteps';
import { IngredientList } from './components/recipe/IngredientList';
import { RecipeCard } from './components/recipe/RecipeCard';
import { Button } from './components/ui/Button';
import { Modal } from './components/ui/Modal';
import type { Recipe } from './types';

// テスト用のサンプルレシピデータ
const sampleRecipe: Recipe = {
  id: '1',
  title: 'チキンカレー',
  description: 'スパイスの効いた本格的なチキンカレーです。家庭でも簡単に作れるレシピです。',
  servings: 4,
  prepTime: 20,
  cookTime: 40,
  difficulty: 2,
  category: '主食',
  ingredients: [
   {
     id: 'ing1',
     name: '鶏もも肉',
     amount: 500,
     unit: 'g',
     notes: '一口大に切る'
   },
   {
     id: 'ing2',
     name: '玉ねぎ',
     amount: 2,
     unit: '個',
     notes: 'みじん切り'
   },
   {
     id: 'ing3',
     name: 'にんじん',
     amount: 1,
     unit: '本',
     notes: '乱切り'
   },
   {
     id: 'ing4',
     name: 'じゃがいも',
     amount: 3,
     unit: '個',
     notes: '一口大に切る'
   },
   {
     id: 'ing5',
     name: 'カレールー',
     amount: 1,
     unit: '箱',
     notes: '中辛'
   },
   {
     id: 'ing6',
     name: '水',
     amount: 800,
     unit: 'ml'
   },
   {
     id: 'ing7',
     name: 'サラダ油',
     amount: 2,
     unit: '大さじ'
   },
   {
     id: 'ing8',
     name: 'にんにく',
     amount: 1,
     unit: '片',
     notes: 'みじん切り'
   }
 ],
 steps: [
   {
     id: 'step1',
     stepNumber: 1,
     description: '鶏もも肉を一口大に切り、玉ねぎ、にんじん、じゃがいもを準備します。にんにくはみじん切りにしておきます。',
   },
   {
     id: 'step2',
     stepNumber: 2,
     description: 'フライパンにサラダ油を熱し、にんにくを炒めて香りを出します。続いて玉ねぎを透明になるまで炒めます。',
     timer: 5
   },
   {
     id: 'step3',
     stepNumber: 3,
     description: '鶏もも肉を加えて、表面に焼き色がつくまで炒めます。',
     timer: 8
   },
   {
     id: 'step4',
     stepNumber: 4,
     description: 'にんじんとじゃがいもを加えて軽く炒めたら、水を加えて煮立たせます。',
   },
   {
     id: 'step5',
     stepNumber: 5,
     description: 'アクを取りながら中火で煮込みます。野菜が柔らかくなるまで煮込んでください。',
     timer: 20
   },
   {
     id: 'step6',
     stepNumber: 6,
     description: '一度火を止めてカレールーを加え、よく溶かします。再び火をつけて弱火で煮込んで完成です。',
     timer: 10
   }
 ],
 tags: ['簡単', '家庭料理', 'スパイシー', '人気'],
 imageUrl: 'https://via.placeholder.com/400x300/f59e0b/ffffff?text=🍛+チキンカレー',
 isFavorite: false,
 rating: 4.5,
 createdAt: '2024-01-15T10:00:00Z',
 updatedAt: '2024-01-15T10:00:00Z',
 cookCount: 3
};

// 他のサンプルレシピ
const sampleRecipes: Recipe[] = [
 sampleRecipe,
 {
   id: '2',
   title: 'シーザーサラダ',
   description: 'クリスピーなクルトンとパルメザンチーズが美味しいシーザーサラダです。',
   servings: 2,
   prepTime: 15,
   cookTime: 0,
   difficulty: 1,
   category: 'サラダ',
   ingredients: [
     {
       id: 'ing9',
       name: 'ロメインレタス',
       amount: 1,
       unit: '株',
       notes: '一口大にちぎる'
     },
     {
       id: 'ing10',
       name: 'パルメザンチーズ',
       amount: 50,
       unit: 'g',
       notes: '削る'
     },
     {
       id: 'ing11',
       name: 'クルトン',
       amount: 50,
       unit: 'g'
     },
     {
       id: 'ing12',
       name: 'シーザードレッシング',
       amount: 3,
       unit: '大さじ'
     }
   ],
   steps: [
     {
       id: 'step7',
       stepNumber: 1,
       description: 'ロメインレタスをよく洗い、水気を切って一口大にちぎります。',
     },
     {
       id: 'step8',
       stepNumber: 2,
       description: 'ボウルにレタス、クルトン、パルメザンチーズを入れ、シーザードレッシングで和えて完成です。',
     }
   ],
   tags: ['ヘルシー', '簡単', '洋食'],
   imageUrl: 'https://via.placeholder.com/400x300/22c55e/ffffff?text=🥗+サラダ',
   isFavorite: true,
   rating: 4.2,
   createdAt: '2024-01-14T15:30:00Z',
   updatedAt: '2024-01-14T15:30:00Z',
   cookCount: 1
 },
 {
   id: '3',
   title: 'チョコレートケーキ',
   description: '濃厚で美味しいチョコレートケーキです。特別な日のデザートにぴったり。',
   servings: 8,
   prepTime: 30,
   cookTime: 45,
   difficulty: 4,
   category: 'デザート',
   ingredients: [
     {
       id: 'ing13',
       name: 'チョコレート',
       amount: 200,
       unit: 'g',
       notes: 'ダークチョコレート'
     },
     {
       id: 'ing14',
       name: 'バター',
       amount: 100,
       unit: 'g'
     },
     {
       id: 'ing15',
       name: '卵',
       amount: 3,
       unit: '個'
     },
     {
       id: 'ing16',
       name: '砂糖',
       amount: 80,
       unit: 'g'
     },
     {
       id: 'ing17',
       name: '薄力粉',
       amount: 60,
       unit: 'g'
     }
   ],
   steps: [
     {
       id: 'step9',
       stepNumber: 1,
       description: 'オーブンを180℃に予熱し、型にバターを塗って粉を振っておきます。',
     },
     {
       id: 'step10',
       stepNumber: 2,
       description: 'チョコレートとバターを湯煎で溶かします。',
       timer: 10
     },
     {
       id: 'step11',
       stepNumber: 3,
       description: '卵と砂糖を白っぽくなるまで泡立て、溶かしたチョコレートを加えて混ぜます。',
       timer: 8
     },
     {
       id: 'step12',
       stepNumber: 4,
       description: '薄力粉をふるって加え、さっくりと混ぜ合わせます。',
     },
     {
       id: 'step13',
       stepNumber: 5,
       description: '型に流し入れ、180℃のオーブンで45分焼きます。',
       timer: 45
     }
   ],
   tags: ['デザート', 'チョコレート', '特別な日'],
   imageUrl: 'https://via.placeholder.com/400x300/8b5cf6/ffffff?text=🍰+ケーキ',
   isFavorite: false,
   rating: 4.8,
   createdAt: '2024-01-13T20:00:00Z',
   updatedAt: '2024-01-13T20:00:00Z',
   cookCount: 0
 }
];

function App() {
 const [recipes, setRecipes] = useState<Recipe[]>(sampleRecipes);
 const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
 const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
 const [currentServings, setCurrentServings] = useState(4);

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

 // レシピの編集（今回はアラートのみ）
 const handleEditRecipe = (recipe: Recipe) => {
   alert(`「${recipe.title}」の編集機能は次回実装予定です！`);
 };

 return (
   <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
     <div className="container mx-auto px-4 py-8">
       {/* ヘッダー */}
       <div className="text-center mb-12">
         <h1 className="text-5xl font-bold text-primary-800 mb-4">
           🍳 レシピ管理アプリ
         </h1>
         <p className="text-xl text-gray-600 mb-6">
           レシピコンポーネント動作テスト
         </p>
         <Button leftIcon={<Plus />} size="lg">
           新しいレシピを追加
         </Button>
       </div>

       {/* 統計情報 */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
         <div className="bg-white rounded-lg p-6 shadow-md text-center">
           <div className="text-3xl font-bold text-primary-600">
             {recipes.length}
           </div>
           <div className="text-gray-600">総レシピ数</div>
         </div>
         <div className="bg-white rounded-lg p-6 shadow-md text-center">
           <div className="text-3xl font-bold text-red-500">
             {recipes.filter(r => r.isFavorite).length}
           </div>
           <div className="text-gray-600">お気に入り</div>
         </div>
         <div className="bg-white rounded-lg p-6 shadow-md text-center">
           <div className="text-3xl font-bold text-green-500">
             {recipes.filter(r => r.difficulty <= 2).length}
           </div>
           <div className="text-gray-600">簡単レシピ</div>
         </div>
         <div className="bg-white rounded-lg p-6 shadow-md text-center">
           <div className="text-3xl font-bold text-blue-500">
             {recipes.reduce((sum, r) => sum + r.cookCount, 0)}
           </div>
           <div className="text-gray-600">総調理回数</div>
         </div>
       </div>

       {/* レシピカード一覧 */}
       <div className="mb-12">
         <h2 className="text-2xl font-bold text-gray-800 mb-6">
           📚 レシピ一覧
         </h2>
         <div className="recipe-grid">
           {recipes.map((recipe) => (
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
       </div>

       {/* サンプル材料リスト */}
       <div className="mb-12">
         <h2 className="text-2xl font-bold text-gray-800 mb-6">
           🥕 材料リスト（テスト）
         </h2>
         <div className="max-w-2xl mx-auto">
           <IngredientList
             ingredients={sampleRecipe.ingredients}
             servings={currentServings}
             onServingsChange={setCurrentServings}
             editable={true}
             onIngredientUpdate={(updatedIngredients) => {
               console.log('材料が更新されました:', updatedIngredients);
             }}
           />
         </div>
       </div>

       {/* サンプル調理手順 */}
       <div className="mb-12">
         <h2 className="text-2xl font-bold text-gray-800 mb-6">
           👨‍🍳 調理手順（テスト）
         </h2>
         <div className="max-w-2xl mx-auto">
           <CookingSteps
             steps={sampleRecipe.steps}
             editable={true}
             onStepUpdate={(updatedSteps) => {
               console.log('手順が更新されました:', updatedSteps);
             }}
           />
         </div>
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