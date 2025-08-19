import type { CookingStep, Ingredient } from '../types';

// エラーメッセージの型定義
export interface ValidationErrors {
  title?: string;
  description?: string;
  servings?: string;
  prepTime?: string;
  cookTime?: string;
  difficulty?: string;
  category?: string;
  ingredients?: string;
  steps?: string;
  imageUrl?: string;
}

// レシピフォームのバリデーション
export const validateRecipeForm = (formData: {
  title: string;
  description: string;
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: number;
  category: string;
  ingredients: Omit<Ingredient, 'id'>[];
  steps: Omit<CookingStep, 'id'>[];
  imageUrl?: string;
}): ValidationErrors => {
  const errors: ValidationErrors = {};

  // タイトルのバリデーション
  if (!formData.title.trim()) {
    errors.title = 'レシピ名は必須です';
  } else if (formData.title.trim().length < 2) {
    errors.title = 'レシピ名は2文字以上で入力してください';
  } else if (formData.title.trim().length > 100) {
    errors.title = 'レシピ名は100文字以内で入力してください';
  }

  // 説明のバリデーション
  if (formData.description.trim().length > 500) {
    errors.description = '説明は500文字以内で入力してください';
  }

  // 人数のバリデーション
  if (formData.servings < 1 || formData.servings > 20) {
    errors.servings = '人数は1〜20人の範囲で入力してください';
  }

  // 準備時間のバリデーション
  if (formData.prepTime < 0 || formData.prepTime > 1440) { // 24時間
    errors.prepTime = '準備時間は0〜1440分の範囲で入力してください';
  }

  // 調理時間のバリデーション
  if (formData.cookTime < 0 || formData.cookTime > 1440) { // 24時間
    errors.cookTime = '調理時間は0〜1440分の範囲で入力してください';
  }

  // 難易度のバリデーション
  if (formData.difficulty < 1 || formData.difficulty > 5) {
    errors.difficulty = '難易度は1〜5の範囲で選択してください';
  }

  // カテゴリのバリデーション
  if (!formData.category.trim()) {
    errors.category = 'カテゴリは必須です';
  }

  // 材料のバリデーション
  if (formData.ingredients.length === 0) {
    errors.ingredients = '材料を最低1つは追加してください';
  } else {
    const invalidIngredients = formData.ingredients.some(
      ingredient => !ingredient.name.trim() || ingredient.amount <= 0
    );
    if (invalidIngredients) {
      errors.ingredients = '材料名と分量を正しく入力してください';
    }
  }

  // 手順のバリデーション
  if (formData.steps.length === 0) {
    errors.steps = '調理手順を最低1つは追加してください';
  } else {
    const invalidSteps = formData.steps.some(
      step => !step.description.trim()
    );
    if (invalidSteps) {
      errors.steps = '手順の説明を入力してください';
    }
  }

  // 画像URLのバリデーション（オプション）
  if (formData.imageUrl && formData.imageUrl.trim()) {
    const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
    if (!urlPattern.test(formData.imageUrl.trim())) {
      errors.imageUrl = '有効な画像URLを入力してください（jpg, png, gif, webp）';
    }
  }

  return errors;
};

// 材料のバリデーション
export const validateIngredient = (ingredient: Omit<Ingredient, 'id'>): string | null => {
  if (!ingredient.name.trim()) {
    return '材料名を入力してください';
  }
  if (ingredient.amount <= 0) {
    return '分量は0より大きい数値を入力してください';
  }
  if (!ingredient.unit.trim()) {
    return '単位を選択してください';
  }
  return null;
};

// 手順のバリデーション
export const validateStep = (step: Omit<CookingStep, 'id'>): string | null => {
  if (!step.description.trim()) {
    return '手順の説明を入力してください';
  }
  if (step.description.trim().length > 500) {
    return '手順の説明は500文字以内で入力してください';
  }
  if (step.timer && (step.timer < 0 || step.timer > 1440)) {
    return 'タイマーは0〜1440分の範囲で入力してください';
  }
  return null;
};

// URLのバリデーション
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// 画像URLのバリデーション
export const isValidImageUrl = (url: string): boolean => {
  if (!isValidUrl(url)) return false;
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp)$/i;
  return imageExtensions.test(url);
};