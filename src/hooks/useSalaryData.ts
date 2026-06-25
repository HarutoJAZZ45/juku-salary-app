import { useContext } from 'react';
import { SalaryDataContext } from '../contexts/salary-data-context';

export const useSalaryData = () => {
    const context = useContext(SalaryDataContext);
    if (!context) throw new Error('useSalaryData must be used within a SalaryDataProvider');
    return context;
};
