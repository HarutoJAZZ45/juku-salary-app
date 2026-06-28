const ANNOUNCEMENT_ID_SUFFIX_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const buildAnnouncementId = (
  suffix: string,
  publishedDate: Date = new Date(),
): string => {
  const normalizedSuffix = suffix.trim().toLowerCase();
  if (
    !normalizedSuffix ||
    normalizedSuffix.length > 60 ||
    !ANNOUNCEMENT_ID_SUFFIX_PATTERN.test(normalizedSuffix)
  ) {
    throw new Error('ID名は半角英小文字・数字・ハイフンで入力してください（例: thank-you）。');
  }

  const dateParts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(publishedDate);
  const readPart = (type: Intl.DateTimeFormatPartTypes): string => (
    dateParts.find(part => part.type === type)?.value ?? ''
  );
  const datePrefix = `${readPart('year')}${readPart('month')}${readPart('day')}`;
  return `${datePrefix}-${normalizedSuffix}`;
};
