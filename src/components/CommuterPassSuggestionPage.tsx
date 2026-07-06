import { ArrowLeft, CalendarRange, Train } from 'lucide-react';
import { format } from 'date-fns';
import type { Campus, WorkEntry } from '../types';
import {
    COMMUTER_PASS_PRICE,
    getBestCommuterPassSuggestion,
    getCommuterPassSuggestions,
    type CommuterPassSuggestion,
} from '../utils/commuterPass';
import './CommuterPassSuggestionPage.css';

interface CommuterPassSuggestionPageProps {
    entries: Record<string, WorkEntry>;
    defaultCampus: Campus;
    onClose: () => void;
}

const formatPeriod = (suggestion: CommuterPassSuggestion): string => (
    `${format(suggestion.startDate, 'M月d日')}〜${format(suggestion.endDate, 'M月d日')}`
);

export function CommuterPassSuggestionPage({
    entries,
    defaultCampus,
    onClose,
}: CommuterPassSuggestionPageProps) {
    const suggestions = getCommuterPassSuggestions(entries, new Date(), defaultCampus);
    const bestSuggestion = getBestCommuterPassSuggestion(suggestions);

    return (
        <main className="commuter-pass-page">
            <header className="commuter-pass-page__navigation">
                <button type="button" onClick={onClose} aria-label="ホームへ戻る">
                    <ArrowLeft size={21} />
                </button>
                <div>
                    <span>COMMUTER PASS</span>
                    <h1>お得な定期期間</h1>
                </div>
            </header>

            <section className="commuter-pass-page__guide">
                <Train size={20} />
                <p>
                    今日以降に登録された平岡・新札幌へのシフトを、
                    1か月定期7,920円と比較しています。
                </p>
            </section>

            {!bestSuggestion ? (
                <section className="commuter-pass-page__empty">
                    <CalendarRange size={28} />
                    <h2>お得になる期間はありません</h2>
                    <p>シフトを追加すると自動で再計算されます。</p>
                </section>
            ) : (
                <>
                    <section className="commuter-pass-page__best">
                        <span>最もお得</span>
                        <div>
                            <h2>{formatPeriod(bestSuggestion)}</h2>
                            <strong>{bestSuggestion.savings.toLocaleString()}円お得</strong>
                        </div>
                        <p>
                            通常 {bestSuggestion.regularFare.toLocaleString()}円
                            <span>定期 {COMMUTER_PASS_PRICE.toLocaleString()}円</span>
                        </p>
                    </section>

                    <section className="commuter-pass-page__results">
                        <div className="commuter-pass-page__results-title">
                            <h2>すべての候補</h2>
                            <span>{suggestions.length}件</span>
                        </div>

                        <div className="commuter-pass-page__list">
                            {suggestions.map(suggestion => {
                                const isBest = suggestion.startDate.getTime()
                                    === bestSuggestion.startDate.getTime();

                                return (
                                    <article
                                        key={suggestion.startDate.toISOString()}
                                        className={isBest ? 'is-best' : undefined}
                                    >
                                        <div>
                                            <div className="commuter-pass-page__period">
                                                <strong>{formatPeriod(suggestion)}</strong>
                                                {isBest && <span>おすすめ</span>}
                                            </div>
                                            <p>
                                                {suggestion.commuteDays}日利用
                                                <span>平日{suggestion.weekdayCount}日</span>
                                                <span>土日祝{suggestion.holidayCount}日</span>
                                            </p>
                                        </div>
                                        <div className="commuter-pass-page__amount">
                                            <strong>{suggestion.savings.toLocaleString()}円</strong>
                                            <span>お得</span>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </section>
                </>
            )}
        </main>
    );
}
