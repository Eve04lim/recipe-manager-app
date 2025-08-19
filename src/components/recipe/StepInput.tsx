import { Clock, MoveDown, MoveUp, Plus, X } from 'lucide-react';
import React, { useState } from 'react';
import type { CookingStep } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';

interface StepInputProps {
  steps: Omit<CookingStep, 'id'>[];
  onChange: (steps: Omit<CookingStep, 'id'>[]) => void;
  error?: string;
}

export const StepInput: React.FC<StepInputProps> = ({
  steps,
  onChange,
  error,
}) => {
  const [newStep, setNewStep] = useState<Omit<CookingStep, 'id'>>({
    stepNumber: steps.length + 1,
    description: '',
    timer: undefined,
    imageUrl: '',
  });

  // 手順を追加
  const addStep = () => {
    if (newStep.description.trim()) {
      const stepToAdd = {
        ...newStep,
        stepNumber: steps.length + 1,
        imageUrl: newStep.imageUrl?.trim() || undefined,
      };
      onChange([...steps, stepToAdd]);
      setNewStep({
        stepNumber: steps.length + 2,
        description: '',
        timer: undefined,
        imageUrl: '',
      });
    }
  };

  // 手順を削除
  const removeStep = (index: number) => {
    const updatedSteps = steps
      .filter((_, i) => i !== index)
      .map((step, i) => ({ ...step, stepNumber: i + 1 }));
    onChange(updatedSteps);
    setNewStep(prev => ({ ...prev, stepNumber: updatedSteps.length + 1 }));
  };

  // 手順を更新
  const updateStep = (index: number, field: keyof CookingStep, value: string | number | undefined) => {
    const updatedSteps = steps.map((step, i) =>
      i === index ? { ...step, [field]: value } : step
    );
    onChange(updatedSteps);
  };

  // 手順の順序を変更
  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;

    const updatedSteps = [...steps];
    [updatedSteps[index], updatedSteps[newIndex]] = [updatedSteps[newIndex], updatedSteps[index]];
    
    // ステップ番号を更新
    const reorderedSteps = updatedSteps.map((step, i) => ({ ...step, stepNumber: i + 1 }));
    onChange(reorderedSteps);
  };

  // Enterキーで追加（Shift+Enterで改行）
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addStep();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          調理手順 ({steps.length}ステップ)
        </h3>
      </div>

      {/* 既存の手順リスト */}
      {steps.length > 0 && (
        <div className="space-y-3">
          {steps.map((step, index) => (
            <Card key={index} padding="sm" className="bg-gray-50">
              <div className="flex gap-3">
                {/* ステップ番号 */}
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {step.stepNumber}
                  </div>
                </div>

                {/* ステップ内容 */}
                <div className="flex-1 space-y-3">
                  {/* 説明 */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      手順の説明 *
                    </label>
                    <textarea
                      value={step.description}
                      onChange={(e) => updateStep(index, 'description', e.target.value)}
                      placeholder="詳しい手順を入力してください..."
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                      rows={3}
                    />
                  </div>

                  {/* タイマーと画像URL */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        タイマー（分）
                      </label>
                      <Input
                        type="number"
                        placeholder="10"
                        value={step.timer || ''}
                        onChange={(e) => updateStep(index, 'timer', e.target.value ? parseInt(e.target.value) : undefined)}
                        leftIcon={<Clock />}
                        fullWidth
                        min="0"
                        max="1440"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        画像URL（オプション）
                      </label>
                      <Input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={step.imageUrl || ''}
                        onChange={(e) => updateStep(index, 'imageUrl', e.target.value)}
                        fullWidth
                      />
                    </div>
                  </div>
                </div>

                {/* 操作ボタン */}
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveStep(index, 'up')}
                    disabled={index === 0}
                    className="w-8 h-8 p-0 text-gray-600 hover:text-gray-800"
                  >
                    <MoveUp className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveStep(index, 'down')}
                    disabled={index === steps.length - 1}
                    className="w-8 h-8 p-0 text-gray-600 hover:text-gray-800"
                  >
                    <MoveDown className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStep(index)}
                    className="w-8 h-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 新しい手順追加フォーム */}
      <Card padding="sm" className="bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          {/* ステップ番号 */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              {newStep.stepNumber}
            </div>
          </div>

          {/* 新しい手順の内容 */}
          <div className="flex-1 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                手順の説明 *
              </label>
              <textarea
                value={newStep.description}
                onChange={(e) => setNewStep({ ...newStep, description: e.target.value })}
                onKeyPress={handleKeyPress}
                placeholder="次の手順を入力してください... (Enterで追加、Shift+Enterで改行)"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  タイマー（分）
                </label>
                <Input
                  type="number"
                  placeholder="例: 10"
                  value={newStep.timer || ''}
                  onChange={(e) => setNewStep({ ...newStep, timer: e.target.value ? parseInt(e.target.value) : undefined })}
                  leftIcon={<Clock />}
                  fullWidth
                  min="0"
                  max="1440"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  画像URL（オプション）
                </label>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={newStep.imageUrl || ''}
                  onChange={(e) => setNewStep({ ...newStep, imageUrl: e.target.value })}
                  fullWidth
                />
              </div>

              <div className="flex items-end">
                <Button
                  variant="primary"
                  onClick={addStep}
                  disabled={!newStep.description.trim()}
                  leftIcon={<Plus />}
                  fullWidth
                >
                  手順を追加
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* エラーメッセージ */}
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {/* ヘルプテキスト */}
      <div className="text-xs text-gray-500">
        <p>💡 ヒント:</p>
        <ul className="list-disc list-inside space-y-1 mt-1">
          <li>Enterキーで手順を追加、Shift+Enterで改行</li>
          <li>↑↓ボタンで手順の順序を変更可能</li>
          <li>タイマーを設定すると調理時に便利です</li>
          <li>手順の画像があると分かりやすくなります</li>
        </ul>
      </div>
    </div>
  );
};