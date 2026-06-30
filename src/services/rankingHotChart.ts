import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { RankingData } from '../types';
import {
  calculateAnnualHotChart,
  getCurrentFiscalYear,
  type AnnualHotChartEntry,
} from '../utils/rankingHotChart';

export const fetchAnnualHotChart = async (
  uid: string,
): Promise<AnnualHotChartEntry[]> => {
  if (!uid) return [];
  const snapshot = await getDocs(collection(db, 'rankings'));
  const rankings = snapshot.docs.map(item => item.data() as RankingData);
  const fiscalYear = getCurrentFiscalYear();
  return calculateAnnualHotChart(rankings, uid, fiscalYear);
};
