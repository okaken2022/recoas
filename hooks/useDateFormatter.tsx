import dayjs from 'dayjs';

export function useDateFormatter(date: string) {
  const formattedMonth = dayjs(date).format('YYYY-MM');
  const formattedMonthJa = dayjs(date).format('YYYY年MM月');
  const formattedDate = dayjs(date).format('YYYY-MM-DD');
  const weekdayNamesJP = ['日', '月', '火', '水', '木', '金', '土'];
  const formattedDateJa = dayjs(date).format(`YYYY年M月D日 (${weekdayNamesJP[dayjs(date).day()]})`);

  return {
    formattedMonth,
    formattedMonthJa,
    formattedDate,
    formattedDateJa,
  };
}
