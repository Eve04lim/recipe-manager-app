import { clsx } from 'clsx';
import { CheckCircle2, Circle, Clock, Pause, Play, RotateCcw } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { CookingStep } from '../../types';
import { Button } from '../ui/Button';
import { Card, CardHeader } from '../ui/Card';

// CookingStepsが受け取るプロパティの型定義
interface CookingStepsProps {
  steps: CookingStep[];
  editable?: boolean;
  onStepUpdate?: (steps: CookingStep[]) => void;
  className?: string;
}

export const CookingSteps: React.FC<CookingStepsProps> = ({
  steps,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  editable = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onStepUpdate,
  className,
}) => {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timers, setTimers] = useState<Map<string, { remaining: number; isRunning: boolean }>>(new Map());

  // タイマー機能
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => {
        const newTimers = new Map(prev);
        let hasChanges = false;

        newTimers.forEach((timer, stepId) => {
          if (timer.isRunning && timer.remaining > 0) {
            newTimers.set(stepId, {
              ...timer,
              remaining: timer.remaining - 1
            });
            hasChanges = true;
          } else if (timer.isRunning && timer.remaining === 0) {
            // タイマー完了の通知
            newTimers.set(stepId, {
              ...timer,
              isRunning: false
            });
            hasChanges = true;
            
            // ブラウザ通知（可能であれば）
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('⏰ タイマー完了！', {
                body: `ステップ ${steps.find(s => s.id === stepId)?.stepNumber} の時間になりました`,
                icon: '🍳'
              });
            }
          }
        });

        return hasChanges ? newTimers : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [steps]);

  // ステップ完了の切り替え
  const toggleStepCompletion = (stepId: string, stepIndex: number) => {
    const newCompletedSteps = new Set(completedSteps);
    if (newCompletedSteps.has(stepId)) {
      newCompletedSteps.delete(stepId);
    } else {
      newCompletedSteps.add(stepId);
      // 完了したステップの次のステップに進む
      if (stepIndex < steps.length - 1) {
        setCurrentStepIndex(stepIndex + 1);
      }
    }
    setCompletedSteps(newCompletedSteps);
  };

  // タイマーの開始/停止
  const toggleTimer = (stepId: string, duration?: number) => {
    if (!duration) return; // durationがundefinedの場合は何もしない
    
    setTimers(prev => {
      const newTimers = new Map(prev);
      const currentTimer = newTimers.get(stepId);
      
      if (currentTimer) {
        newTimers.set(stepId, {
          ...currentTimer,
          isRunning: !currentTimer.isRunning
        });
      } else {
        newTimers.set(stepId, {
          remaining: duration * 60, // 分を秒に変換
          isRunning: true
        });
      }
      
      return newTimers;
    });
  };

  // タイマーのリセット
  const resetTimer = (stepId: string, duration?: number) => {
    if (!duration) return; // durationがundefinedの場合は何もしない
    
    setTimers(prev => {
      const newTimers = new Map(prev);
      newTimers.set(stepId, {
        remaining: duration * 60,
        isRunning: false
      });
      return newTimers;
    });
  };

  // 時間を分:秒形式にフォーマット
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">
            調理手順 ({steps.length}ステップ)
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              進捗: {completedSteps.size}/{steps.length}
            </span>
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedSteps.size / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.has(step.id);
          const isCurrent = index === currentStepIndex;
          const timer = timers.get(step.id);
          
          return (
            <div
              key={step.id}
              className={clsx(
                'relative border-2 rounded-lg p-4 transition-all duration-200',
                isCompleted && 'bg-green-50 border-green-200',
                isCurrent && !isCompleted && 'bg-blue-50 border-blue-200 shadow-md',
                !isCompleted && !isCurrent && 'bg-white border-gray-200'
              )}
            >
              {/* ステップ番号とチェックボックス */}
              <div className="flex items-start gap-4">
                <div className="flex items-center gap-3">
                  {/* ステップ番号 */}
                  <div className={clsx(
                    'flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold',
                    isCompleted 
                      ? 'bg-green-500 text-white'
                      : isCurrent 
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                  )}>
                    {step.stepNumber}
                  </div>
                  
                  {/* 完了チェックボタン */}
                  <button
                    onClick={() => toggleStepCompletion(step.id, index)}
                    className={clsx(
                      'transition-colors duration-200',
                      isCompleted ? 'text-green-500' : 'text-gray-400 hover:text-green-500'
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </button>
                </div>

                {/* ステップ内容 */}
                <div className="flex-1">
                  <p className={clsx(
                    'text-gray-900 leading-relaxed',
                    isCompleted && 'line-through text-gray-500'
                  )}>
                    {step.description}
                  </p>

                  {/* ステップ画像 */}
                  {step.imageUrl && (
                    <div className="mt-3">
                      <img
                        src={step.imageUrl}
                        alt={`ステップ ${step.stepNumber}`}
                        className="w-full max-w-md h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* タイマー */}
                  {step.timer && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600">
                            タイマー: {step.timer}分
                          </span>
                        </div>
                        
                        {timer && (
                          <div className={clsx(
                            'text-lg font-mono font-bold',
                            timer.remaining === 0 ? 'text-red-500' : 'text-blue-600'
                          )}>
                            {formatTime(timer.remaining)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleTimer(step.id, step.timer)}
                          leftIcon={timer?.isRunning ? <Pause /> : <Play />}
                        >
                          {timer?.isRunning ? '一時停止' : '開始'}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => resetTimer(step.id, step.timer)}
                          leftIcon={<RotateCcw />}
                        >
                          リセット
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 現在のステップのハイライト */}
              {isCurrent && !isCompleted && (
                <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* 手順が空の場合 */}
      {steps.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">👨‍🍳</div>
          <p>調理手順がまだ追加されていません</p>
        </div>
      )}

      {/* 完了メッセージ */}
      {steps.length > 0 && completedSteps.size === steps.length && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
          <div className="text-2xl mb-2">🎉</div>
          <h4 className="text-lg font-semibold text-green-800 mb-1">
            お疲れ様でした！
          </h4>
          <p className="text-green-600">
            全ての手順が完了しました。美味しいお料理の完成です！
          </p>
        </div>
      )}
    </Card>
  );
};