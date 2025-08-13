import { clsx } from 'clsx';
import { Minus, Plus, X } from 'lucide-react';
import React, { useState } from 'react';
import type { Ingredient } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardHeader } from '../ui/Card';

// IngredientListが受け取るプロパティの型定義
interface IngredientListProps {
  ingredients: Ingredient[];
  servings: number;
  editable?: boolean;
  onServingsChange?: (newServings: number) => void;
  onIngredientUpdate?: (ingredients: Ingredient[]) => void;
  className?: string;
}

export const IngredientList: React.FC<IngredientListProps> = ({
  ingredients,
  servings,
  editable = false,
  onServingsChange,
  onIngredientUpdate,
  className,
}) => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  // 材料の量を人数に応じて調整
  const adjustAmountForServings = (amount: number, originalServings: number) => {
    if (originalServings === 0) return amount;
    const ratio = servings / originalServings;
    const adjustedAmount = amount * ratio;
    
    // 小数点以下の表示を調整
    if (adjustedAmount < 1) {
      return adjustedAmount.toFixed(2);
    } else if (adjustedAmount < 10) {
      return adjustedAmount.toFixed(1);
    } else {
      return Math.round(adjustedAmount);
    }
  };

  // チェックボックスの状態変更
  const handleCheckToggle = (ingredientId: string) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(ingredientId)) {
      newCheckedItems.delete(ingredientId);
    } else {
      newCheckedItems.add(ingredientId);
    }
    setCheckedItems(newCheckedItems);
  };

  // 材料の削除
  const handleRemoveIngredient = (ingredientId: string) => {
    if (onIngredientUpdate) {
      const updatedIngredients = ingredients.filter(ing => ing.id !== ingredientId);
      onIngredientUpdate(updatedIngredients);
    }
  };

  // 人数調整ボタン
  const ServingsAdjuster = () => (
    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
      <span className="text-sm font-medium text-gray-700">人数:</span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onServingsChange?.(Math.max(1, servings - 1))}
          disabled={servings <= 1}
          className="w-8 h-8 p-0"
        >
          <Minus className="w-4 h-4" />
        </Button>
        
        <span className="font-bold text-lg min-w-[2rem] text-center">
          {servings}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onServingsChange?.(servings + 1)}
          disabled={servings >= 20}
          className="w-8 h-8 p-0"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <span className="text-sm text-gray-600">人分</span>
    </div>
  );

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">
            材料 ({ingredients.length}品目)
          </h3>
          <Badge variant="primary">
            {checkedItems.size}/{ingredients.length} 準備完了
          </Badge>
        </div>
        
        {/* 人数調整 */}
        {onServingsChange && <ServingsAdjuster />}
      </CardHeader>

      {/* 材料リスト */}
      <div className="space-y-2">
        {ingredients.map((ingredient) => {
          const isChecked = checkedItems.has(ingredient.id);
          const adjustedAmount = adjustAmountForServings(ingredient.amount, servings);
          
          return (
            <div
              key={ingredient.id}
              className={clsx(
                'flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200',
                isChecked 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              )}
            >
              {/* チェックボックス */}
              <button
                onClick={() => handleCheckToggle(ingredient.id)}
                className={clsx(
                  'w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center',
                  isChecked
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 hover:border-green-400'
                )}
              >
                {isChecked && (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              {/* 材料名と分量 */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={clsx(
                    'font-medium',
                    isChecked ? 'line-through text-gray-500' : 'text-gray-900'
                  )}>
                    {ingredient.name}
                  </span>
                  
                  {/* 分量 */}
                  <div className="flex items-center gap-1">
                    <span className={clsx(
                      'font-bold',
                      isChecked ? 'text-gray-500' : 'text-primary-600'
                    )}>
                      {adjustedAmount}
                    </span>
                    <span className={clsx(
                      'text-sm',
                      isChecked ? 'text-gray-400' : 'text-gray-600'
                    )}>
                      {ingredient.unit}
                    </span>
                  </div>
                </div>
                
                {/* 備考 */}
                {ingredient.notes && (
                  <p className={clsx(
                    'text-sm mt-1',
                    isChecked ? 'text-gray-400' : 'text-gray-500'
                  )}>
                    {ingredient.notes}
                  </p>
                )}
              </div>

              {/* 削除ボタン（編集可能な場合） */}
              {editable && onIngredientUpdate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveIngredient(ingredient.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 w-8 h-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* 材料が空の場合 */}
      {ingredients.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🥕</div>
          <p>材料がまだ追加されていません</p>
        </div>
      )}

      {/* 進捗表示 */}
      {ingredients.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>準備進捗</span>
            <span>{Math.round((checkedItems.size / ingredients.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(checkedItems.size / ingredients.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </Card>
  );
};