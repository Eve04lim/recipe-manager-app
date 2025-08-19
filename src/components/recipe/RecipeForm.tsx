import { Image as ImageIcon, Save, Tag, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { DifficultyLevel, Recipe, RecipeCategory } from '../../types';
import { validateRecipeForm, type ValidationErrors } from '../../utils/validation';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { IngredientInput } from './IngredientInput';
import { StepInput } from './StepInput';

interface RecipeFormProps {
  recipe?: Recipe; // 編集時に渡される
  onSave: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'cookCount' | 'lastCooked'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const RecipeForm: React.FC<RecipeFormProps> = ({
  recipe,
  onSave,
  onCancel,
  isLoading = false,
}) => {
  // フォームの状態
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    servings: 2,
    prepTime: 15,
    cookTime: 30,
    difficulty: 2 as DifficultyLevel,
    category: '主食' as RecipeCategory,
    ingredients: [] as Parameters<typeof IngredientInput>[0]['ingredients'],
    steps: [] as Parameters<typeof StepInput>[0]['steps'],
    tags: [] as string[],
    imageUrl: '',
    isFavorite: false,
    rating: undefined as number | undefined,
    notes: '',
  });

  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // 編集時の初期値設定
  useEffect(() => {
    if (recipe) {
      setFormData({
        title: recipe.title,
        description: recipe.description || '',
        servings: recipe.servings,
       prepTime: recipe.prepTime,
       cookTime: recipe.cookTime,
       difficulty: recipe.difficulty,
       category: recipe.category,
       ingredients: recipe.ingredients.map(ing => ({
         name: ing.name,
         amount: ing.amount,
         unit: ing.unit,
         notes: ing.notes,
       })),
       steps: recipe.steps.map(step => ({
         stepNumber: step.stepNumber,
         description: step.description,
         timer: step.timer,
         imageUrl: step.imageUrl,
       })),
       tags: [...recipe.tags],
       imageUrl: recipe.imageUrl || '',
       isFavorite: recipe.isFavorite,
       rating: recipe.rating,
       notes: recipe.notes || '',
     });
     setPreviewImage(recipe.imageUrl || null);
   }
 }, [recipe]);

 // カテゴリオプション
 const categoryOptions: RecipeCategory[] = [
   '主食', '主菜', '副菜', 'スープ', 'サラダ', 'デザート', '飲み物',
   '和食', '洋食', '中華', 'イタリアン', 'その他'
 ];

 // 難易度オプション
 const difficultyOptions = [
   { value: 1, label: 'とても簡単', emoji: '😊', color: 'success' },
   { value: 2, label: '簡単', emoji: '🙂', color: 'info' },
   { value: 3, label: '普通', emoji: '😐', color: 'warning' },
   { value: 4, label: '難しい', emoji: '😰', color: 'danger' },
   { value: 5, label: 'とても難しい', emoji: '😱', color: 'danger' },
 ] as const;

 // 画像URLの変更時にプレビューを更新
 const handleImageUrlChange = (url: string) => {
   setFormData(prev => ({ ...prev, imageUrl: url }));
   
   if (url && url.trim()) {
     // 画像の読み込みテスト
     const img = new Image();
     img.onload = () => setPreviewImage(url);
     img.onerror = () => setPreviewImage(null);
     img.src = url;
   } else {
     setPreviewImage(null);
   }
 };

 // タグを追加
 const addTag = () => {
   const tag = newTag.trim();
   if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
     setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
     setNewTag('');
   }
 };

 // タグを削除
 const removeTag = (tagToRemove: string) => {
   setFormData(prev => ({
     ...prev,
     tags: prev.tags.filter(tag => tag !== tagToRemove)
   }));
 };

 // タグのEnterキー処理
 const handleTagKeyPress = (e: React.KeyboardEvent) => {
   if (e.key === 'Enter') {
     e.preventDefault();
     addTag();
   }
 };

 // フォーム送信
 const handleSubmit = (e: React.FormEvent) => {
   e.preventDefault();
   
   // バリデーション
   const validationErrors = validateRecipeForm(formData);
   setErrors(validationErrors);

   // エラーがある場合は送信しない
   if (Object.keys(validationErrors).length > 0) {
     // 最初のエラーフィールドにスクロール
     const firstErrorField = Object.keys(validationErrors)[0];
     const element = document.getElementById(firstErrorField);
     element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
     return;
   }

   // レシピデータを構築
   const recipeData = {
     title: formData.title.trim(),
     description: formData.description.trim(),
     servings: formData.servings,
     prepTime: formData.prepTime,
     cookTime: formData.cookTime,
     difficulty: formData.difficulty,
     category: formData.category,
     ingredients: formData.ingredients.map((ing, index) => ({
       id: `ing-${Date.now()}-${index}`,
       name: ing.name.trim(),
       amount: ing.amount,
       unit: ing.unit,
       notes: ing.notes?.trim(),
     })),
     steps: formData.steps.map((step, index) => ({
       id: `step-${Date.now()}-${index}`,
       stepNumber: index + 1,
       description: step.description.trim(),
       timer: step.timer,
       imageUrl: step.imageUrl?.trim() || undefined,
     })),
     tags: formData.tags,
     imageUrl: formData.imageUrl.trim() || undefined,
     thumbnailUrl: formData.imageUrl.trim() || undefined,
     isFavorite: formData.isFavorite,
     rating: formData.rating,
     notes: formData.notes.trim() || undefined,
     nutritionInfo: undefined,
   };

   onSave(recipeData);
 };

 return (
   <form onSubmit={handleSubmit} className="space-y-8">
     {/* 基本情報 */}
     <Card>
       <div className="p-6 space-y-6">
         <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">
           基本情報
         </h2>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* レシピ名 */}
           <div className="md:col-span-2">
             <Input
               id="title"
               label="レシピ名"
               type="text"
               value={formData.title}
               onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
               placeholder="美味しいレシピ名を入力してください"
               error={errors.title}
               fullWidth
             />
           </div>

           {/* 説明 */}
           <div className="md:col-span-2">
             <label className="block text-sm font-medium text-gray-700 mb-1">
               説明
             </label>
             <textarea
               id="description"
               value={formData.description}
               onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
               placeholder="レシピの説明や特徴を入力してください..."
               className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${
                 errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
               }`}
               rows={3}
             />
             {errors.description && (
               <p className="text-sm text-red-600 mt-1">{errors.description}</p>
             )}
           </div>

           {/* 人数 */}
           <div>
             <Input
               id="servings"
               label="人数"
               type="number"
               value={formData.servings}
               onChange={(e) => setFormData(prev => ({ ...prev, servings: parseInt(e.target.value) || 1 }))}
               min={1}
               max={20}
               error={errors.servings}
               helperText="1〜20人"
               fullWidth
             />
           </div>

           {/* カテゴリ */}
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">
               カテゴリ
             </label>
             <select
               id="category"
               value={formData.category}
               onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as RecipeCategory }))}
               className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${
                 errors.category ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
               }`}
             >
               {categoryOptions.map((category) => (
                 <option key={category} value={category}>
                   {category}
                 </option>
               ))}
             </select>
             {errors.category && (
               <p className="text-sm text-red-600 mt-1">{errors.category}</p>
             )}
           </div>

           {/* 準備時間 */}
           <div>
             <Input
               id="prepTime"
               label="準備時間（分）"
               type="number"
               value={formData.prepTime}
               onChange={(e) => setFormData(prev => ({ ...prev, prepTime: parseInt(e.target.value) || 0 }))}
               min={0}
               max={1440}
               error={errors.prepTime}
               helperText="0〜1440分"
               fullWidth
             />
           </div>

           {/* 調理時間 */}
           <div>
             <Input
               id="cookTime"
               label="調理時間（分）"
               type="number"
               value={formData.cookTime}
               onChange={(e) => setFormData(prev => ({ ...prev, cookTime: parseInt(e.target.value) || 0 }))}
               min={0}
               max={1440}
               error={errors.cookTime}
               helperText="0〜1440分"
               fullWidth
             />
           </div>
         </div>

         {/* 難易度 */}
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-3">
             難易度
           </label>
           <div className="flex flex-wrap gap-2">
             {difficultyOptions.map((option) => (
               <button
                 key={option.value}
                 type="button"
                 onClick={() => setFormData(prev => ({ ...prev, difficulty: option.value }))}
                 className={`px-4 py-2 rounded-lg border transition-all duration-200 flex items-center gap-2 ${
                   formData.difficulty === option.value
                     ? 'bg-primary-500 text-white border-primary-500'
                     : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300 hover:bg-primary-50'
                 }`}
               >
                 <span className="text-lg">{option.emoji}</span>
                 <span className="text-sm">{option.label}</span>
               </button>
             ))}
           </div>
           {errors.difficulty && (
             <p className="text-sm text-red-600 mt-1">{errors.difficulty}</p>
           )}
         </div>

         {/* 画像URL */}
         <div>
           <Input
             id="imageUrl"
             label="画像URL（オプション）"
             type="url"
             value={formData.imageUrl}
             onChange={(e) => handleImageUrlChange(e.target.value)}
             placeholder="https://example.com/image.jpg"
             leftIcon={<ImageIcon />}
             error={errors.imageUrl}
             helperText="jpg, png, gif, webp形式の画像URL"
             fullWidth
           />
           
           {/* 画像プレビュー */}
           {previewImage && (
             <div className="mt-3">
               <img
                 src={previewImage}
                 alt="プレビュー"
                 className="w-32 h-24 object-cover rounded-lg border border-gray-200"
               />
             </div>
           )}
         </div>

         {/* タグ */}
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-3">
             タグ ({formData.tags.length}/10)
           </label>
           
           {/* 既存のタグ */}
           {formData.tags.length > 0 && (
             <div className="flex flex-wrap gap-2 mb-3">
               {formData.tags.map((tag) => (
                 <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                   #{tag}
                   <button
                     type="button"
                     onClick={() => removeTag(tag)}
                     className="ml-1 text-gray-500 hover:text-gray-700"
                   >
                     <X className="w-3 h-3" />
                   </button>
                 </Badge>
               ))}
             </div>
           )}

           {/* 新しいタグ追加 */}
           <div className="flex gap-2">
             <Input
               type="text"
               value={newTag}
               onChange={(e) => setNewTag(e.target.value)}
               onKeyPress={handleTagKeyPress}
               placeholder="新しいタグを入力..."
               leftIcon={<Tag />}
               className="flex-1"
             />
             <Button
               type="button"
               variant="outline"
               onClick={addTag}
               disabled={!newTag.trim() || formData.tags.includes(newTag.trim()) || formData.tags.length >= 10}
             >
               追加
             </Button>
           </div>
           <p className="text-xs text-gray-500 mt-1">
             例: 簡単、ヘルシー、時短、子供向け
           </p>
         </div>
       </div>
     </Card>

     {/* 材料 */}
     <Card>
       <div className="p-6">
         <IngredientInput
           ingredients={formData.ingredients}
           onChange={(ingredients) => setFormData(prev => ({ ...prev, ingredients }))}
           error={errors.ingredients}
         />
       </div>
     </Card>

     {/* 調理手順 */}
     <Card>
       <div className="p-6">
         <StepInput
           steps={formData.steps}
           onChange={(steps) => setFormData(prev => ({ ...prev, steps }))}
           error={errors.steps}
         />
       </div>
     </Card>

     {/* その他の設定 */}
     <Card>
       <div className="p-6 space-y-4">
         <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">
           その他の設定
         </h2>

         {/* お気に入り */}
         <div className="flex items-center gap-3">
           <input
             type="checkbox"
             id="isFavorite"
             checked={formData.isFavorite}
             onChange={(e) => setFormData(prev => ({ ...prev, isFavorite: e.target.checked }))}
             className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
           />
           <label htmlFor="isFavorite" className="text-sm font-medium text-gray-700">
             お気に入りに追加
           </label>
         </div>

         {/* 評価 */}
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-2">
             評価（オプション）
           </label>
           <div className="flex gap-1">
             {[1, 2, 3, 4, 5].map((star) => (
               <button
                 key={star}
                 type="button"
                 onClick={() => setFormData(prev => ({ 
                   ...prev, 
                   rating: prev.rating === star ? undefined : star 
                 }))}
                 className={`p-1 text-2xl transition-colors ${
                   formData.rating && star <= formData.rating
                     ? 'text-yellow-400'
                     : 'text-gray-300 hover:text-yellow-300'
                 }`}
               >
                 ⭐
               </button>
             ))}
             {formData.rating && (
               <button
                 type="button"
                 onClick={() => setFormData(prev => ({ ...prev, rating: undefined }))}
                 className="ml-2 text-sm text-gray-500 hover:text-gray-700"
               >
                 クリア
               </button>
             )}
           </div>
         </div>

         {/* メモ */}
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">
             メモ（オプション）
           </label>
           <textarea
             value={formData.notes}
             onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
             placeholder="作った時の感想や改善点など..."
             className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
             rows={3}
           />
         </div>
       </div>
     </Card>

     {/* アクションボタン */}
     <div className="flex gap-3 justify-end sticky bottom-4 bg-white p-4 rounded-lg shadow-lg border">
       <Button
         type="button"
         variant="outline"
         onClick={onCancel}
         disabled={isLoading}
       >
         キャンセル
       </Button>
       <Button
         type="submit"
         loading={isLoading}
         leftIcon={<Save />}
       >
         {recipe ? '更新' : '保存'}
       </Button>
     </div>
   </form>
 );
};