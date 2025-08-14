
import { Filter, Search, X } from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface RecipeSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterToggle: () => void;
  showFilters: boolean;
  resultCount: number;
  totalCount: number;
  onReset: () => void;
}

export const RecipeSearchBar: React.FC<RecipeSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onFilterToggle,
  showFilters,
  resultCount,
  totalCount,
  onReset,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-4">
      {/* 検索バー */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="レシピ、材料、タグで検索..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            leftIcon={<Search />}
            rightIcon={searchQuery ? (
              <button
                onClick={() => onSearchChange('')}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            ) : undefined}
            className={`transition-all duration-200 ${
              isFocused ? 'ring-2 ring-primary-500 border-primary-500' : ''
            }`}
          />
          
          {/* 検索候補（将来的に実装予定） */}
          {isFocused && searchQuery && (
            <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-lg border border-gray-200 mt-1 z-10 max-h-40 overflow-y-auto">
              <div className="p-2 text-sm text-gray-600">
                検索候補機能は今後実装予定です
              </div>
            </div>
          )}
        </div>

        {/* フィルタボタン */}
        <Button
          variant={showFilters ? "primary" : "outline"}
          onClick={onFilterToggle}
          leftIcon={<Filter />}
          className="flex-shrink-0"
        >
          フィルタ
        </Button>

        {/* リセットボタン */}
        {(searchQuery || resultCount !== totalCount) && (
          <Button
            variant="ghost"
            onClick={onReset}
            leftIcon={<X />}
            className="flex-shrink-0 text-gray-600 hover:text-gray-800"
          >
            リセット
          </Button>
        )}
      </div>

      {/* 検索結果の表示 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">{resultCount}</span>
            {totalCount !== resultCount && (
              <span> / {totalCount}</span>
            )}
            件のレシピ
          </span>
          
          {searchQuery && (
            <Badge variant="primary" size="sm">
              「{searchQuery}」で検索中
            </Badge>
          )}
        </div>

        {/* クイック統計 */}
        {resultCount > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>平均調理時間: 約30分</span>
            <span>•</span>
            <span>お気に入り: {Math.round((resultCount / totalCount) * 100)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};