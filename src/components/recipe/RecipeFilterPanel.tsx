import { ChefHat, Clock, Heart, Image, RotateCcw } from 'lucide-react';
import React from 'react';
import type { DifficultyLevel, RecipeCategory, RecipeFilter } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface RecipeFilterPanelProps {
  filters: RecipeFilter;
  onFilterChange: <K extends keyof RecipeFilter>(key: K, value: RecipeFilter[K]) => void;
  onReset: () => void;
  availableTags: string[];
  isVisible: boolean;
}

export const RecipeFilterPanel: React.FC<RecipeFilterPanelProps> = ({
  filters,
  onFilterChange,
  onReset,
  availableTags,
  isVisible,
}) => {
  if (!isVisible) return null;

  const categories: (RecipeCategory | 'all')[] = [
    'all', '主食', '主菜', '副菜', 'スープ', 'サラダ', 'デザート', '飲み物',
    '和食', '洋食', '中華', 'イタリアン', 'その他'
  ];

  const difficulties: { value: DifficultyLevel; label: string; color: string }[] = [
    { value: 1, label: 'とても簡単', color: 'success' },
    { value: 2, label: '簡単', color: 'info' },
    { value: 3, label: '普通', color: 'warning' },
    { value: 4, label: '難しい', color: 'danger' },
    { value: 5, label: 'とても難しい', color: 'danger' },
  ];

  const timeOptions = [
    { value: 15, label: '15分以内' },
    { value: 30, label: '30分以内' },
    { value: 60, label: '1時間以内' },
    { value: 120, label: '2時間以内' },
  ];

  return (
    <Card className="p-6 space-y-6 animate-in slide-in-from-top duration-300">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">絞り込み検索</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          leftIcon={<RotateCcw />}
        >
          リセット
        </Button>
      </div>

      {/* カテゴリフィルタ */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">カテゴリ</h4>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onFilterChange('category', category)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-all duration-200 ${
                filters.category === category
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300 hover:bg-primary-50'
              }`}
            >
              {category === 'all' ? '全て' : category}
            </button>
          ))}
        </div>
      </div>

      {/* 難易度フィルタ */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">難易度</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onFilterChange('difficulty', undefined)}
            className={`px-3 py-1.5 text-sm rounded-full border transition-all duration-200 ${
              filters.difficulty === undefined
                ? 'bg-gray-500 text-white border-gray-500'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
            }`}
          >
            全て
          </button>
          {difficulties.map((diff) => (
            <button
              key={diff.value}
              onClick={() => onFilterChange('difficulty', diff.value)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-all duration-200 flex items-center gap-1 ${
                filters.difficulty === diff.value
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300 hover:bg-primary-50'
              }`}
            >
              <ChefHat className="w-3 h-3" />
              {diff.label}
            </button>
          ))}
        </div>
      </div>

      {/* 時間フィルタ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 準備時間 */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">準備時間</h4>
          <div className="space-y-2">
            <button
              onClick={() => onFilterChange('maxPrepTime', undefined)}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg border transition-all duration-200 ${
                filters.maxPrepTime === undefined
                  ? 'bg-gray-500 text-white border-gray-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              制限なし
            </button>
            {timeOptions.map((option) => (
              <button
                key={`prep-${option.value}`}
                onClick={() => onFilterChange('maxPrepTime', option.value)}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg border transition-all duration-200 flex items-center gap-2 ${
                  filters.maxPrepTime === option.value
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300 hover:bg-primary-50'
                }`}
              >
                <Clock className="w-3 h-3" />
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 調理時間 */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">調理時間</h4>
          <div className="space-y-2">
            <button
              onClick={() => onFilterChange('maxCookTime', undefined)}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg border transition-all duration-200 ${
                filters.maxCookTime === undefined
                  ? 'bg-gray-500 text-white border-gray-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              制限なし
            </button>
            {timeOptions.map((option) => (
              <button
                key={`cook-${option.value}`}
                onClick={() => onFilterChange('maxCookTime', option.value)}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg border transition-all duration-200 flex items-center gap-2 ${
                  filters.maxCookTime === option.value
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300 hover:bg-primary-50'
                }`}
              >
                <Clock className="w-3 h-3" />
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* その他のフィルタ */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">その他</h4>
        <div className="space-y-3">
          {/* お気に入り */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="favorite-filter"
              checked={filters.isFavorite === true}
              onChange={(e) => onFilterChange('isFavorite', e.target.checked ? true : undefined)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="favorite-filter" className="flex items-center gap-2 text-sm text-gray-700">
              <Heart className="w-4 h-4 text-red-500" />
              お気に入りのみ
            </label>
          </div>

          {/* 画像あり */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="image-filter"
              checked={filters.hasImage === true}
              onChange={(e) => onFilterChange('hasImage', e.target.checked ? true : undefined)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="image-filter" className="flex items-center gap-2 text-sm text-gray-700">
              <Image className="w-4 h-4 text-blue-500" />
              画像ありのみ
            </label>
          </div>
        </div>
      </div>

      {/* タグフィルタ */}
      {availableTags.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">タグ</h4>
          <div className="flex flex-wrap gap-2">
            {availableTags.slice(0, 20).map((tag) => {
              const isSelected = filters.tags?.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => {
                    const currentTags = filters.tags || [];
                    const newTags = isSelected
                      ? currentTags.filter(t => t !== tag)
                      : [...currentTags, tag];
                    onFilterChange('tags', newTags);
                  }}
                  className={`px-2 py-1 text-xs rounded-full border transition-all duration-200 ${
                    isSelected
                      ? 'bg-secondary-500 text-white border-secondary-500'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-secondary-300 hover:bg-secondary-50'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
          {availableTags.length > 20 && (
            <p className="text-xs text-gray-500 mt-2">
              +{availableTags.length - 20} 個のタグ
            </p>
          )}
        </div>
      )}

      {/* アクティブフィルタの表示 */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">適用中のフィルタ</h4>
        <div className="flex flex-wrap gap-2">
          {filters.category && filters.category !== 'all' && (
            <Badge variant="primary" size="sm">
              カテゴリ: {filters.category}
            </Badge>
          )}
          {filters.difficulty && (
            <Badge variant="info" size="sm">
              難易度: {difficulties.find(d => d.value === filters.difficulty)?.label}
            </Badge>
          )}
          {filters.maxPrepTime && (
            <Badge variant="warning" size="sm">
              準備時間: {filters.maxPrepTime}分以内
            </Badge>
          )}
          {filters.maxCookTime && (
            <Badge variant="warning" size="sm">
              調理時間: {filters.maxCookTime}分以内
            </Badge>
          )}
          {filters.isFavorite && (
            <Badge variant="danger" size="sm">
              お気に入り
            </Badge>
          )}
          {filters.hasImage && (
            <Badge variant="info" size="sm">
              画像あり
            </Badge>
          )}
          {filters.tags && filters.tags.length > 0 && (
            filters.tags.map(tag => (
              <Badge key={tag} variant="secondary" size="sm">
                #{tag}
              </Badge>
            ))
          )}
        </div>
      </div>
    </Card>
  );
};