import { Plus, X } from 'lucide-react';
import React, { useState } from 'react';
import type { Ingredient, MeasurementUnit } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';

interface IngredientInputProps {
  ingredients: Omit<Ingredient, 'id'>[];
  onChange: (ingredients: Omit<Ingredient, 'id'>[]) => void;
  error?: string;
}

export const IngredientInput: React.FC<IngredientInputProps> = ({
  ingredients,
  onChange,
  error,
}) => {
  const [newIngredient, setNewIngredient] = useState<Omit<Ingredient, 'id'>>({
    name: '',
    amount: 0,
    unit: 'g',
    notes: '',
  });

  // 単位のオプション
  const unitOptions: MeasurementUnit[] = [
    'g', 'kg', 'ml', 'l', 'cc',
    '個', '本', '枚', '切れ',
    '大さじ', '小さじ', 'カップ',
    '少々', 'ひとつまみ', '適量',
    '箱', '袋', '缶', '瓶',
    '片', '房', '株', '束',
    'パック', 'セット', '丁'
  ];

  // 材料を追加
  const addIngredient = () => {
    if (newIngredient.name.trim() && newIngredient.amount > 0) {
      onChange([...ingredients, { ...newIngredient }]);
      setNewIngredient({
        name: '',
        amount: 0,
        unit: 'g',
        notes: '',
      });
    }
  };

  // 材料を削除
  const removeIngredient = (index: number) => {
    const updatedIngredients = ingredients.filter((_, i) => i !== index);
    onChange(updatedIngredients);
  };

  // 材料を更新
  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
    const updatedIngredients = ingredients.map((ingredient, i) =>
      i === index ? { ...ingredient, [field]: value } : ingredient
    );
    onChange(updatedIngredients);
  };

  // Enterキーで追加
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIngredient();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          材料 ({ingredients.length}品目)
        </h3>
      </div>

      {/* 既存の材料リスト */}
      {ingredients.length > 0 && (
        <div className="space-y-2">
          {ingredients.map((ingredient, index) => (
            <Card key={index} padding="sm" className="bg-gray-50">
              <div className="grid grid-cols-12 gap-2 items-center">
                {/* 材料名 */}
                <div className="col-span-4">
                  <Input
                    type="text"
                    placeholder="材料名"
                    value={ingredient.name}
                    onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                    fullWidth
                  />
                </div>

                {/* 分量 */}
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="分量"
                    value={ingredient.amount || ''}
                    onChange={(e) => updateIngredient(index, 'amount', parseFloat(e.target.value) || 0)}
                    fullWidth
                    min="0"
                    step="0.1"
                  />
                </div>

                {/* 単位 */}
                <div className="col-span-2">
                  <select
                    value={ingredient.unit}
                    onChange={(e) => updateIngredient(index, 'unit', e.target.value as MeasurementUnit)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                  >
                    {unitOptions.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 備考 */}
                <div className="col-span-3">
                  <Input
                    type="text"
                    placeholder="備考（みじん切りなど）"
                    value={ingredient.notes || ''}
                    onChange={(e) => updateIngredient(index, 'notes', e.target.value)}
                    fullWidth
                  />
                </div>

                {/* 削除ボタン */}
                <div className="col-span-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeIngredient(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 w-8 h-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 新しい材料追加フォーム */}
      <Card padding="sm" className="bg-blue-50 border-blue-200">
        <div className="grid grid-cols-12 gap-2 items-end">
          {/* 材料名 */}
          <div className="col-span-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              材料名 *
            </label>
            <Input
              type="text"
              placeholder="例: 玉ねぎ"
              value={newIngredient.name}
              onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
              onKeyPress={handleKeyPress}
              fullWidth
            />
          </div>

          {/* 分量 */}
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              分量 *
            </label>
            <Input
              type="number"
              placeholder="1"
              value={newIngredient.amount || ''}
              onChange={(e) => setNewIngredient({ ...newIngredient, amount: parseFloat(e.target.value) || 0 })}
              onKeyPress={handleKeyPress}
              fullWidth
              min="0"
              step="0.1"
            />
          </div>

          {/* 単位 */}
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              単位 *
            </label>
            <select
              value={newIngredient.unit}
              onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value as MeasurementUnit })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
            >
              {unitOptions.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>

          {/* 備考 */}
          <div className="col-span-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              備考
            </label>
            <Input
              type="text"
              placeholder="みじん切り"
              value={newIngredient.notes || ''}
              onChange={(e) => setNewIngredient({ ...newIngredient, notes: e.target.value })}
              onKeyPress={handleKeyPress}
              fullWidth
            />
          </div>

          {/* 追加ボタン */}
          <div className="col-span-1">
            <Button
              variant="primary"
              size="sm"
              onClick={addIngredient}
              disabled={!newIngredient.name.trim() || newIngredient.amount <= 0}
              className="w-8 h-8 p-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* エラーメッセージ */}
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {/* ヘルプテキスト */}
      <div className="text-xs text-gray-500">
        <p>💡 ヒント:</p>
        <ul className="list-disc list-inside space-y-1 mt-1">
          <li>Enterキーを押すか➕ボタンをクリックして材料を追加</li>
          <li>分量は小数点も入力可能（例: 1.5）</li>
          <li>備考欄には「みじん切り」「薄切り」などの下処理を記入</li>
        </ul>
      </div>
    </div>
  );
};