import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import React from 'react';
import type { RecipeSort } from '../../types';
import { Button } from '../ui/Button';

interface RecipeSortControlsProps {
  sort: RecipeSort;
  onSortChange: (field: RecipeSort['field'], direction?: RecipeSort['direction']) => void;
  resultCount: number;
}

export const RecipeSortControls: React.FC<RecipeSortControlsProps> = ({
  sort,
  onSortChange,
  resultCount,
}) => {
  const sortOptions: { field: RecipeSort['field']; label: string }[] = [
    { field: 'title', label: 'タイトル' },
    { field: 'createdAt', label: '作成日' },
    { field: 'lastCooked', label: '最終調理日' },
    { field: 'cookCount', label: '調理回数' },
    { field: 'rating', label: '評価' },
    { field: 'prepTime', label: '準備時間' },
    { field: 'cookTime', label: '調理時間' },
  ];

  const getSortIcon = (field: RecipeSort['field']) => {
    if (sort.field !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sort.direction === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-primary-600" />
      : <ArrowDown className="w-4 h-4 text-primary-600" />;
  };

  return (
    <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">並び替え:</span>
        <div className="flex flex-wrap gap-1">
          {sortOptions.map((option) => (
            <Button
              key={option.field}
              variant={sort.field === option.field ? "primary" : "ghost"}
              size="sm"
              onClick={() => onSortChange(option.field)}
              rightIcon={getSortIcon(option.field)}
              className="text-xs"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="text-sm text-gray-500">
        {resultCount}件
      </div>
    </div>
  );
};