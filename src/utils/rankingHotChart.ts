import type { RankingData } from '../types';

export type AnnualRankingCategory = 'classes' | 'days';

export interface AnnualHotChartEntry {
  category: AnnualRankingCategory;
  rank: 1 | 2 | 3;
  score: number;
  fiscalYear: number;
}

export const getCurrentFiscalYear = (date = new Date()): number => {
  const year = date.getFullYear();
  return date.getMonth() < 3 ? year - 1 : year;
};

export const sortRankingsByScore = (
  rankings: RankingData[],
  periodType: 'monthly' | 'yearly',
  targetKey: string,
  category: AnnualRankingCategory,
): RankingData[] =>
  [...rankings].sort((left, right) => {
    const leftScore = left[periodType]?.[targetKey]?.[category] ?? 0;
    const rightScore = right[periodType]?.[targetKey]?.[category] ?? 0;
    const scoreDifference = rightScore - leftScore;
    if (scoreDifference) return scoreDifference;

    const levelDifference = (right.level ?? 1) - (left.level ?? 1);
    return levelDifference || left.uid.localeCompare(right.uid);
  });

export const calculateAnnualHotChart = (
  rankings: RankingData[],
  targetUid: string,
  fiscalYear: number,
): AnnualHotChartEntry[] => {
  const yearKey = String(fiscalYear);
  const categories: AnnualRankingCategory[] = ['classes', 'days'];

  return categories.flatMap(category => {
    const topThree = sortRankingsByScore(
      rankings.filter(item => (item.yearly?.[yearKey]?.[category] ?? 0) > 0),
      'yearly',
      yearKey,
      category,
    ).slice(0, 3);
    const index = topThree.findIndex(item => item.uid === targetUid);
    if (index < 0) return [];

    return [{
      category,
      rank: (index + 1) as 1 | 2 | 3,
      score: topThree[index].yearly[yearKey][category],
      fiscalYear,
    }];
  });
};
