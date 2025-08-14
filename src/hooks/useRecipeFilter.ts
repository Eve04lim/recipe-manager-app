import { useMemo, useState } from 'react';
import type { Recipe, RecipeFilter, RecipeSort } from '../types';

export const useRecipeFilter = (recipes: Recipe[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<RecipeFilter>({
    category: 'all',
    difficulty: undefined,
    maxPrepTime: undefined,
    maxCookTime: undefined,
    tags: [],
    isFavorite: undefined,
    hasImage: undefined,
  });
  const [sort, setSort] = useState<RecipeSort>({
    field: 'createdAt',
    direction: 'desc'
  });

  // フィルタリングされたレシピ
  const filteredRecipes = useMemo(() => {
    let filtered = [...recipes];

    // テキスト検索
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(recipe => 
        recipe.title.toLowerCase().includes(query) ||
        recipe.description?.toLowerCase().includes(query) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(query)) ||
        recipe.ingredients.some(ingredient => 
          ingredient.name.toLowerCase().includes(query)
        ) ||
        recipe.category.toLowerCase().includes(query)
      );
    }

    // カテゴリフィルタ
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(recipe => recipe.category === filters.category);
    }

    // 難易度フィルタ
    if (filters.difficulty !== undefined) {
      filtered = filtered.filter(recipe => recipe.difficulty === filters.difficulty);
    }

    // 準備時間フィルタ
    if (filters.maxPrepTime !== undefined) {
      filtered = filtered.filter(recipe => recipe.prepTime <= filters.maxPrepTime!);
    }

    // 調理時間フィルタ
    if (filters.maxCookTime !== undefined) {
      filtered = filtered.filter(recipe => recipe.cookTime <= filters.maxCookTime!);
    }

    // お気に入りフィルタ
    if (filters.isFavorite !== undefined) {
      filtered = filtered.filter(recipe => recipe.isFavorite === filters.isFavorite);
    }

    // 画像フィルタ
    if (filters.hasImage !== undefined) {
      if (filters.hasImage) {
        filtered = filtered.filter(recipe => recipe.imageUrl || recipe.thumbnailUrl);
      } else {
        filtered = filtered.filter(recipe => !recipe.imageUrl && !recipe.thumbnailUrl);
      }
    }

    // タグフィルタ
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(recipe => 
        filters.tags!.some(tag => recipe.tags.includes(tag))
      );
    }

    // ソート
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sort.field) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'lastCooked':
          aValue = a.lastCooked ? new Date(a.lastCooked) : new Date(0);
          bValue = b.lastCooked ? new Date(b.lastCooked) : new Date(0);
          break;
        case 'cookCount':
          aValue = a.cookCount;
          bValue = b.cookCount;
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case 'prepTime':
          aValue = a.prepTime;
          bValue = b.prepTime;
          break;
        case 'cookTime':
          aValue = a.cookTime;
          bValue = b.cookTime;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [recipes, searchQuery, filters, sort]);

  // フィルタのリセット
  const resetFilters = () => {
    setSearchQuery('');
    setFilters({
      category: 'all',
      difficulty: undefined,
      maxPrepTime: undefined,
      maxCookTime: undefined,
      tags: [],
      isFavorite: undefined,
      hasImage: undefined,
    });
    setSort({
      field: 'createdAt',
      direction: 'desc'
    });
  };

  // 検索クエリの更新
  const updateSearchQuery = (query: string) => {
    setSearchQuery(query);
  };

  // フィルタの更新
  const updateFilter = <K extends keyof RecipeFilter>(
    key: K,
    value: RecipeFilter[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // ソートの更新
  const updateSort = (field: RecipeSort['field'], direction?: RecipeSort['direction']) => {
    setSort(prev => ({
      field,
      direction: direction || (prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc')
    }));
  };

  // 統計情報
  const stats = useMemo(() => {
    const totalRecipes = recipes.length;
    const filteredCount = filteredRecipes.length;
    const favoriteCount = filteredRecipes.filter(r => r.isFavorite).length;
    const categories = [...new Set(filteredRecipes.map(r => r.category))];
    const avgRating = filteredRecipes.length > 0
      ? filteredRecipes.reduce((sum, r) => sum + (r.rating || 0), 0) / filteredRecipes.length
      : 0;

    return {
      totalRecipes,
      filteredCount,
      favoriteCount,
      categories,
      avgRating: Math.round(avgRating * 10) / 10,
    };
  }, [recipes, filteredRecipes]);

  return {
    searchQuery,
    filters,
    sort,
    filteredRecipes,
    stats,
    updateSearchQuery,
    updateFilter,
    updateSort,
    resetFilters,
  };
};