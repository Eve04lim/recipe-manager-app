import { RecipeService } from '../lib/database';
import type { Recipe } from '../types';

// サンプルレシピデータ
export const sampleRecipes: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'cookCount'>[] = [
  {
    title: 'チキンカレー',
    description: 'スパイシーで濃厚なチキンカレーです。家族みんなが喜ぶ定番メニュー。',
    servings: 4,
    prepTime: 20,
    cookTime: 40,
    difficulty: 2,
    category: '主食',
    ingredients: [
      { id: 'ing1', name: '鶏もも肉', amount: 500, unit: 'g', notes: '一口大に切る' },
      { id: 'ing2', name: '玉ねぎ', amount: 2, unit: '個', notes: 'みじん切り' },
      { id: 'ing3', name: 'にんじん', amount: 1, unit: '本', notes: '乱切り' },
      { id: 'ing4', name: 'じゃがいも', amount: 3, unit: '個', notes: '一口大に切る' },
      { id: 'ing5', name: 'カレールー', amount: 1, unit: '箱', notes: '中辛' },
      { id: 'ing6', name: '水', amount: 800, unit: 'ml' },
      { id: 'ing7', name: 'サラダ油', amount: 2, unit: '大さじ' },
      { id: 'ing8', name: 'にんにく', amount: 1, unit: '片', notes: 'みじん切り' },
    ],
    steps: [
      { id: 'step1', stepNumber: 1, description: '鶏もも肉を一口大に切り、野菜を準備します。' },
      { id: 'step2', stepNumber: 2, description: 'フライパンにサラダ油を熱し、にんにくと玉ねぎを炒めます。', timer: 5 },
      { id: 'step3', stepNumber: 3, description: '鶏もも肉を加えて、表面に焼き色がつくまで炒めます。', timer: 8 },
      { id: 'step4', stepNumber: 4, description: 'にんじんとじゃがいもを加えて軽く炒め、水を加えて煮立たせます。' },
      { id: 'step5', stepNumber: 5, description: 'アクを取りながら中火で煮込みます。', timer: 20 },
      { id: 'step6', stepNumber: 6, description: '一度火を止めてカレールーを加え、よく溶かして完成です。', timer: 10 },
    ],
    tags: ['簡単', '家庭料理', 'スパイシー', '人気'],
    imageUrl: 'https://via.placeholder.com/400x300/f59e0b/ffffff?text=🍛+チキンカレー',
    isFavorite: false,
    rating: 4.5,
    notes: 'ルーを入れる前に一度火を止めるのがポイント',
  },
  {
    title: 'シーザーサラダ',
    description: 'クリスピーなクルトンとパルメザンチーズが美味しいシーザーサラダです。',
    servings: 2,
    prepTime: 15,
    cookTime: 0,
    difficulty: 1,
    category: 'サラダ',
    ingredients: [
      { id: 'ing9', name: 'ロメインレタス', amount: 1, unit: '株', notes: '一口大にちぎる' },
      { id: 'ing10', name: 'パルメザンチーズ', amount: 50, unit: 'g', notes: '削る' },
      { id: 'ing11', name: 'クルトン', amount: 50, unit: 'g' },
      { id: 'ing12', name: 'シーザードレッシング', amount: 3, unit: '大さじ' },
    ],
    steps: [
      { id: 'step7', stepNumber: 1, description: 'ロメインレタスをよく洗い、水気を切って一口大にちぎります。' },
      { id: 'step8', stepNumber: 2, description: 'ボウルにレタス、クルトン、パルメザンチーズを入れ、シーザードレッシングで和えて完成です。' },
    ],
    tags: ['ヘルシー', '簡単', '洋食', '副菜'],
    imageUrl: 'https://via.placeholder.com/400x300/22c55e/ffffff?text=🥗+サラダ',
    isFavorite: true,
    rating: 4.2,
  },
  {
    title: 'チョコレートケーキ',
    description: '濃厚で美味しいチョコレートケーキです。特別な日のデザートにぴったり。',
    servings: 8,
    prepTime: 30,
    cookTime: 45,
    difficulty: 4,
    category: 'デザート',
    ingredients: [
      { id: 'ing13', name: 'チョコレート', amount: 200, unit: 'g', notes: 'ダークチョコレート' },
      { id: 'ing14', name: 'バター', amount: 100, unit: 'g' },
      { id: 'ing15', name: '卵', amount: 3, unit: '個' },
      { id: 'ing16', name: '砂糖', amount: 80, unit: 'g' },
      { id: 'ing17', name: '薄力粉', amount: 60, unit: 'g' },
    ],
    steps: [
      { id: 'step9', stepNumber: 1, description: 'オーブンを180℃に予熱し、型にバターを塗って粉を振っておきます。' },
      { id: 'step10', stepNumber: 2, description: 'チョコレートとバターを湯煎で溶かします。', timer: 10 },
      { id: 'step11', stepNumber: 3, description: '卵と砂糖を白っぽくなるまで泡立て、溶かしたチョコレートを加えて混ぜます。', timer: 8 },
      { id: 'step12', stepNumber: 4, description: '薄力粉をふるって加え、さっくりと混ぜ合わせます。' },
      { id: 'step13', stepNumber: 5, description: '型に流し入れ、180℃のオーブンで45分焼きます。', timer: 45 },
    ],
    tags: ['デザート', 'チョコレート', '特別な日', '手作り'],
    imageUrl: 'https://via.placeholder.com/400x300/8b5cf6/ffffff?text=🍰+ケーキ',
    isFavorite: false,
    rating: 4.8,
    notes: '粉を入れた後は混ぜすぎないように注意',
  },
  {
    title: 'パスタアラビアータ',
    description: 'ピリ辛のトマトソースが絶品のパスタです。',
    servings: 2,
    prepTime: 10,
    cookTime: 15,
    difficulty: 2,
    category: 'イタリアン',
    ingredients: [
      { id: 'ing18', name: 'パスタ', amount: 200, unit: 'g' },
      { id: 'ing19', name: 'ホールトマト', amount: 1, unit: '缶' },
      { id: 'ing20', name: 'にんにく', amount: 2, unit: '片', notes: 'みじん切り' },
      { id: 'ing21', name: 'オリーブオイル', amount: 3, unit: '大さじ' },
      { id: 'ing22', name: '唐辛子', amount: 1, unit: '本' },
    ],
    steps: [
      { id: 'step14', stepNumber: 1, description: 'パスタを茹でる準備をします。' },
      { id: 'step15', stepNumber: 2, description: 'にんにくと唐辛子をオリーブオイルで炒めます。', timer: 3 },
      { id: 'step16', stepNumber: 3, description: 'トマトソースを加えて煮込みます。', timer: 10 },
      { id: 'step17', stepNumber: 4, description: '茹でたパスタと絡めて完成です。' },
    ],
    tags: ['イタリアン', 'パスタ', 'ピリ辛', '簡単'],
    imageUrl: 'https://via.placeholder.com/400x300/dc2626/ffffff?text=🍝+パスタ',
    isFavorite: true,
    rating: 4.7,
  },
  {
    title: 'グリーンスムージー',
    description: 'ヘルシーで栄養満点のグリーンスムージーです。朝食にぴったり！',
    servings: 2,
    prepTime: 5,
    cookTime: 0,
    difficulty: 1,
    category: '飲み物',
    ingredients: [
      { id: 'ing23', name: 'ほうれん草', amount: 50, unit: 'g' },
      { id: 'ing24', name: 'バナナ', amount: 1, unit: '本' },
      { id: 'ing25', name: 'りんご', amount: 1, unit: '個' },
      { id: 'ing26', name: '水', amount: 200, unit: 'ml' },
      { id: 'ing27', name: 'はちみつ', amount: 1, unit: '大さじ' },
    ],
    steps: [
      { id: 'step18', stepNumber: 1, description: 'フルーツと野菜をカットします。' },
      { id: 'step19', stepNumber: 2, description: 'すべての材料をミキサーに入れて撹拌します。', timer: 2 },
      { id: 'step20', stepNumber: 3, description: 'グラスに注いで完成です。' },
    ],
    tags: ['ヘルシー', 'スムージー', '朝食', '野菜', 'フルーツ'],
    isFavorite: true,
    rating: 4.1,
    notes: '冷凍フルーツを使うとより冷たくて美味しい',
  },
];

// データベースの初期化関数
export const initializeSampleData = async (): Promise<void> => {
  try {
    console.log('🔍 データベースの状態をチェック中...');
    
    // 既存のレシピ数をチェック
    const existingRecipes = await RecipeService.getAllRecipes();
    console.log(`📝 既存レシピ数: ${existingRecipes.length}件`);
    
    if (existingRecipes.length === 0) {
      console.log('📚 サンプルデータを初期化中...');
      
      // サンプルレシピを順次追加
      for (const [index, recipeData] of sampleRecipes.entries()) {
        try {
          console.log(`➕ レシピ ${index + 1}/${sampleRecipes.length} を追加中: ${recipeData.title}`);
          await RecipeService.addRecipe(recipeData);
        } catch (error) {
          console.error(`❌ レシピ「${recipeData.title}」の追加に失敗:`, error);
          // 一つのレシピの追加に失敗しても続行
        }
      }
      
      // 追加後の確認
      const finalCount = await RecipeService.getAllRecipes();
      console.log(`✅ ${finalCount.length}件のサンプルレシピを追加しました`);
    } else {
      console.log(`📝 既存のレシピが${existingRecipes.length}件見つかりました`);
    }
  } catch (error) {
    console.error('❌ サンプルデータの初期化に失敗:', error);
    
    // より詳細なエラー情報
    if (error instanceof Error) {
      console.error('エラーメッセージ:', error.message);
      console.error('スタックトレース:', error.stack);
    }
    
    // データベースの問題の可能性がある場合
    if (error instanceof Error && error.message.includes('IndexedDB')) {
      console.log('💡 IndexedDBの問題の可能性があります。ブラウザの設定を確認してください。');
    }
    
    throw error;
  }
};

// データベースのリセット関数（開発用）
export const resetDatabase = async (): Promise<void> => {
  try {
    console.log('🔄 データベースをリセット中...');
    
    // 既存データをクリア
    await RecipeService.clearDatabase();
    
    // サンプルデータを再追加
    await initializeSampleData();
    
    console.log('✅ データベースのリセットが完了しました');
  } catch (error) {
    console.error('❌ データベースのリセットに失敗:', error);
  }
};

// データベースの統計情報を表示
export const showDatabaseStats = async (): Promise<void> => {
  try {
    const stats = await RecipeService.getStats();
    
    console.group('📊 データベース統計情報');
    console.log('総レシピ数:', stats.totalRecipes);
    console.log('お気に入り:', stats.favoriteRecipes);
    console.log('平均評価:', stats.avgRating);
    console.log('カテゴリ別:', stats.categoryBreakdown);
    console.log('難易度別:', stats.difficultyBreakdown);
    console.log('人気タグ:', stats.popularTags.slice(0, 5));
    if (stats.mostCookedRecipe) {
      console.log('最も作られたレシピ:', stats.mostCookedRecipe.title, `(${stats.mostCookedRecipe.cookCount}回)`);
    }
    console.groupEnd();
  } catch (error) {
    console.error('❌ 統計情報の取得に失敗:', error);
  }
};

// レシピのバックアップを作成
export const createBackup = async (): Promise<string> => {
  try {
    const recipes = await RecipeService.exportData();
    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      recipeCount: recipes.length,
      recipes,
    };
    
    const backupJson = JSON.stringify(backup, null, 2);
    console.log(`💾 ${recipes.length}件のレシピをバックアップしました`);
    
    return backupJson;
  } catch (error) {
    console.error('❌ バックアップの作成に失敗:', error);
    throw error;
  }
};

// バックアップからデータを復元
export const restoreFromBackup = async (backupData: string): Promise<void> => {
  try {
    const backup = JSON.parse(backupData);
    
    if (!backup.recipes || !Array.isArray(backup.recipes)) {
      throw new Error('無効なバックアップ形式です');
    }
    
    console.log(`🔄 ${backup.recipes.length}件のレシピを復元中...`);
    
    // 既存データをクリア
    await RecipeService.clearDatabase();
    
    // バックアップデータをインポート
    await RecipeService.importData(backup.recipes);
    
    console.log('✅ バックアップからの復元が完了しました');
  } catch (error) {
    console.error('❌ バックアップからの復元に失敗:', error);
    throw error;
  }
};

// データベースの整合性をチェック
export const validateDatabase = async (): Promise<void> => {
  try {
    console.log('🔍 データベースの整合性をチェック中...');
    
    const validation = await RecipeService.validateDatabase();
    
    if (validation.isValid) {
      console.log('✅ データベースの整合性に問題はありません');
    } else {
      console.warn('⚠️ データベースに問題が見つかりました:');
      validation.errors.forEach(error => console.warn(`  - ${error}`));
    }
  } catch (error) {
    console.error('❌ データベースの整合性チェックに失敗:', error);
  }
};

// ランダムなサンプルレシピを生成（テスト用）
export const generateRandomRecipe = (): Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'cookCount'> => {
  const titles = ['美味しい', '絶品', '簡単', '本格', '家庭の', 'プロの', '時短', 'ヘルシー'];
  const dishes = ['カレー', 'パスタ', 'サラダ', 'スープ', 'ケーキ', '炒め物', '煮物', '焼き物'];
  const categories = ['主食', '主菜', '副菜', 'スープ', 'サラダ', 'デザート'] as const;
  const tags = ['簡単', 'ヘルシー', '時短', '節約', '栄養満点', '子供向け', '大人向け', '和風', '洋風'];
  
  const randomTitle = `${titles[Math.floor(Math.random() * titles.length)]}${dishes[Math.floor(Math.random() * dishes.length)]}`;
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  const randomTags = tags.sort(() => 0.5 - Math.random()).slice(0, 3);
  
  return {
    title: randomTitle,
    description: `${randomTitle}の美味しいレシピです。`,
    servings: Math.floor(Math.random() * 6) + 2,
    prepTime: Math.floor(Math.random() * 30) + 5,
    cookTime: Math.floor(Math.random() * 60) + 10,
    difficulty: Math.floor(Math.random() * 5) + 1 as 1 | 2 | 3 | 4 | 5,
    category: randomCategory,
    ingredients: [
      { id: 'rand1', name: 'メイン食材', amount: 200, unit: 'g' },
      { id: 'rand2', name: '調味料', amount: 1, unit: '大さじ' },
      { id: 'rand3', name: '野菜', amount: 1, unit: '個' },
    ],
    steps: [
      { id: 'randstep1', stepNumber: 1, description: '材料を準備します。' },
      { id: 'randstep2', stepNumber: 2, description: '調理します。', timer: 10 },
      { id: 'randstep3', stepNumber: 3, description: '完成です。' },
    ],
    tags: randomTags,
    imageUrl: `https://via.placeholder.com/400x300/ff6b6b/ffffff?text=🍽️+${encodeURIComponent(randomTitle)}`,
    isFavorite: Math.random() > 0.7,
    rating: Math.random() > 0.5 ? Math.floor(Math.random() * 5) + 1 : undefined,
  };
};

// 大量のテストデータを生成（パフォーマンステスト用）
export const generateTestData = async (count: number = 50): Promise<void> => {
  try {
    console.log(`🧪 ${count}件のテストレシピを生成中...`);
    
    const promises = Array.from({ length: count }, () => {
      const randomRecipe = generateRandomRecipe();
      return RecipeService.addRecipe(randomRecipe);
    });
    
    await Promise.all(promises);
    
    console.log(`✅ ${count}件のテストレシピを追加しました`);
  } catch (error) {
    console.error('❌ テストデータの生成に失敗:', error);
  }
};

// デバッグ用のユーティリティ関数をグローバルに公開（開発環境のみ）
if (process.env.NODE_ENV === 'development') {
  (window as Record<string, unknown>).recipeUtils = {
    initializeSampleData,
    resetDatabase,
    showDatabaseStats,
    createBackup,
    restoreFromBackup,
    validateDatabase,
    generateRandomRecipe,
    generateTestData,
  };
  
  console.log('🛠️ Recipe Utils Available:', {
    'window.recipeUtils.showDatabaseStats()': 'データベース統計を表示',
    'window.recipeUtils.resetDatabase()': 'データベースをリセット',
    'window.recipeUtils.generateTestData(50)': 'テストデータを50件生成',
    'window.recipeUtils.createBackup()': 'バックアップを作成',
    'window.recipeUtils.validateDatabase()': 'データベースの整合性チェック',
  });
}