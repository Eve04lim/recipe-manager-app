import { clsx } from 'clsx';
import { ChefHat, Clock, Edit3, Heart, Star, Trash2, Users } from 'lucide-react';
import React from 'react';
import type { Recipe } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

// RecipeCardが受け取るプロパティの型定義
interface RecipeCardProps {
  recipe: Recipe;
  onView?: (recipe: Recipe) => void;
  onEdit?: (recipe: Recipe) => void;
  onDelete?: (recipeId: string) => void;
  onToggleFavorite?: (recipeId: string) => void;
  showActions?: boolean;
  className?: string;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onView,
  onEdit,
  onDelete,
  onToggleFavorite,
  showActions = true,
  className,
}) => {
  // 画像エラー時のフォールバック処理
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=🍳+No+Image';
  };

  // 難易度に応じたバッジバリアント
  const getDifficultyVariant = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'success';
      case 2: return 'info';
      case 3: return 'warning';
      case 4: return 'danger';
      case 5: return 'danger';
      default: return 'default';
    }
  };

  // 難易度のテキスト
  const getDifficultyText = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'とても簡単';
      case 2: return '簡単';
      case 3: return '普通';
      case 4: return '難しい';
      case 5: return 'とても難しい';
      default: return '不明';
    }
  };

  // 合計時間の計算
  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <Card 
      hover
      padding="none"
      className={clsx('overflow-hidden group', className)}
    >
      {/* 画像エリア */}
      <div className="relative aspect-recipe overflow-hidden">
        <img
          src={recipe.imageUrl || recipe.thumbnailUrl}
          alt={recipe.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={handleImageError}
        />
        
        {/* お気に入りボタン（画像上部右） */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(recipe.id);
            }}
            className={clsx(
              'absolute top-3 right-3 p-2 rounded-full shadow-md transition-all duration-200',
              recipe.isFavorite 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
            )}
          >
            <Heart 
              className={clsx(
                'w-4 h-4',
                recipe.isFavorite && 'fill-current'
              )} 
            />
          </button>
        )}

        {/* 編集ボタン（画像上部左） */}
        {onEdit && showActions && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(recipe);
            }}
            className="absolute top-3 left-3 p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition-all duration-200"
          >
            <Edit3 className="w-4 h-4 text-gray-600" />
          </button>
        )}

        {/* 難易度バッジ（画像下部） */}
        <div className="absolute bottom-3 left-3">
          <Badge 
            variant={getDifficultyVariant(recipe.difficulty)}
            size="sm"
            icon={<ChefHat />}
          >
            {getDifficultyText(recipe.difficulty)}
          </Badge>
        </div>

        {/* 評価（星）- 画像下部右 */}
        {recipe.rating && (
          <div className="absolute bottom-3 right-3">
            <div className="flex items-center bg-white/90 rounded-full px-2 py-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
              <span className="text-sm font-medium text-gray-700">
                {recipe.rating.toFixed(1)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* コンテンツエリア */}
      <div className="p-4">
        {/* タイトルとカテゴリ */}
        <div className="mb-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-1">
              {recipe.title}
            </h3>
            <Badge variant="primary" size="sm">
              {recipe.category}
            </Badge>
          </div>
          
          {/* 説明 */}
          {recipe.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {recipe.description}
            </p>
          )}
        </div>

        {/* メタ情報 */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          {/* 調理時間 */}
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{totalTime}分</span>
          </div>
          
          {/* 人数 */}
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{recipe.servings}人分</span>
          </div>

          {/* 作った回数 */}
          {recipe.cookCount > 0 && (
            <div className="flex items-center gap-1">
              <ChefHat className="w-4 h-4" />
              <span>{recipe.cookCount}回作成</span>
            </div>
          )}
        </div>

        {/* タグ */}
        {recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {recipe.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                variant="default" 
                size="sm"
                className="text-xs"
              >
                #{tag}
              </Badge>
            ))}
            {recipe.tags.length > 3 && (
              <Badge variant="default" size="sm" className="text-xs">
                +{recipe.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* アクションボタン */}
        {showActions && (
          <div className="flex gap-2">
            {onView && (
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => onView(recipe)}
              >
                詳細を見る
              </Button>
            )}
            
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(recipe.id);
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};