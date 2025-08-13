import { clsx } from 'clsx';
import React, { forwardRef } from 'react';

// Inputコンポーネントが受け取るプロパティの型定義
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

// forwardRefを使用してref を転送できるようにする
export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = true,
  className,
  id,
  ...props
}, ref) => {
  // ユニークなIDを生成（labelとの関連付けに使用）
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={clsx('space-y-1', fullWidth && 'w-full')}>
      {/* ラベル */}
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      
      {/* 入力フィールド */}
      <div className="relative">
        {/* 左側のアイコン */}
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-gray-400">
              {leftIcon}
            </div>
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            // 基本スタイル
            'block w-full rounded-lg border-gray-300 shadow-sm transition-colors duration-200',
            // フォーカス時のスタイル
            'focus:border-primary-500 focus:ring-primary-500 focus:ring-1',
            // エラー時のスタイル
            error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
            // アイコンがある場合のパディング調整
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            className
          )}
          {...props}
        />
        
        {/* 右側のアイコン */}
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-gray-400">
              {rightIcon}
            </div>
          </div>
        )}
      </div>
      
      {/* エラーメッセージ */}
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {/* ヘルパーテキスト */}
      {helperText && !error && (
        <p className="text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

// displayNameを設定（デバッグ用）
Input.displayName = 'Input';