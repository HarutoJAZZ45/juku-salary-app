import { ChevronRight, Train } from 'lucide-react';
import { format } from 'date-fns';
import type { Campus, WorkEntry } from '../types';
import {
    COMMUTER_PASS_PRICE,
    getBestCommuterPassSuggestion,
    getCommuterPassSuggestions,
    type CommuterPassSuggestion,
} from '../utils/commuterPass';
import './CommuterPassSuggestionCard.css';

interface CommuterPassSuggestionCardProps {
    entries: Record<string, WorkEntry>;
    defaultCampus: Campus;
    onOpenDetails: () => void;
}

const formatPeriod = (suggestion: CommuterPassSuggestion): string => (
    `${format(suggestion.startDate, 'M月d日')}〜${format(suggestion.endDate, 'M月d日')}`
);

export const CommuterPassSuggestionCard = ({
    entries,
    defaultCampus,
    onOpenDetails,
}: CommuterPassSuggestionCardProps) => {
    const suggestions = getCommuterPassSuggestions(entries, new Date(), defaultCampus);
    const bestSuggestion = getBestCommuterPassSuggestion(suggestions);

    if (!bestSuggestion) {
        return (
            <section className="commuter-pass-card commuter-pass-card--empty">
                <div className="commuter-pass-card__icon" aria-hidden="true">
                    <Train size={17} />
                </div>
                <div>
                    <h3>地下鉄定期サジェスト</h3>
                    <p>現在の登録済みシフトでは、通常運賃の方がお得です。</p>
                </div>
            </section>
        );
    }

    return (
        <section className="commuter-pass-card">
            <div className="commuter-pass-card__header">
                <div className="commuter-pass-card__title">
                    <span className="commuter-pass-card__icon" aria-hidden="true">
                        <Train size={17} />
                    </span>
                    <div>
                        <h3>地下鉄定期サジェスト</h3>
                        <span>登録済みシフトのみで計算</span>
                    </div>
                </div>
                <span className="commuter-pass-card__count">
                    {suggestions.length}期間
                </span>
            </div>

            <div className="commuter-pass-card__best">
                <div>
                    <span className="commuter-pass-card__recommendation">おすすめ</span>
                    <strong>{formatPeriod(bestSuggestion)}</strong>
                </div>
                <strong className="commuter-pass-card__savings">
                    {bestSuggestion.savings.toLocaleString()}円お得
                </strong>
            </div>

            <div className="commuter-pass-card__comparison">
                <span>通常 {bestSuggestion.regularFare.toLocaleString()}円</span>
                <span>定期 {COMMUTER_PASS_PRICE.toLocaleString()}円</span>
                <span>{bestSuggestion.commuteDays}日利用</span>
            </div>

            {suggestions.length > 1 && (
                <button
                    type="button"
                    className="commuter-pass-card__toggle"
                    onClick={onOpenDetails}
                >
                    他のお得な期間を見る
                    <ChevronRight size={16} />
                </button>
            )}
        </section>
    );
};
