// components/NextHolidayText.js
import { useEffect, useState } from 'react';

const bookHolidays = [
  { label: '📚 יום הספר הבינלאומי', date: '04-23' },
  { label: '📖 יום אוהבי הספרים', date: '08-09' },
  { label: '🖋️ יום הסופרים', date: '11-01' },
  { label: '📘 שבוע הספר הישראלי', date: '06-10' },
  { label: '📗 יום הספר העברי', date: '06-13' },
  { label: '🎁 Book Giving Day', date: '02-14' },
];

function getNextHoliday() {
  const today = new Date();
  const year = today.getFullYear();

  const upcoming = bookHolidays
    .map(holiday => {
      const [month, day] = holiday.date.split('-');
      let holidayDate = new Date(`${year}-${month}-${day}T00:00:00`);

      if (holidayDate < today) {
        holidayDate = new Date(`${year + 1}-${month}-${day}T00:00:00`);
      }

      return {
        ...holiday,
        targetDate: holidayDate,
        timeUntil: holidayDate - today,
      };
    })
    .sort((a, b) => a.timeUntil - b.timeUntil)[0];

  return upcoming;
}

function formatTimeLeft(distanceMs) {
  const totalSeconds = Math.floor(distanceMs / 1000);
  const ימים = Math.floor(totalSeconds / (3600 * 24));
  const שעות = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const דקות = Math.floor((totalSeconds % 3600) / 60);
  const שניות = totalSeconds % 60;

  return `${ימים} ימים ${שעות} שעות ${דקות} דקות ${שניות} שניות`;
}

function useNextBookHolidayText() {
  const [text, setText] = useState('');

  useEffect(() => {
    const holiday = getNextHoliday();

    const updateText = () => {
      const now = new Date();
      const distance = holiday.targetDate - now;

      if (distance <= 0) {
        setText(`${holiday.label} התחיל 🎉`);
        return;
      }

      setText(`${holiday.label} בעוד: ${formatTimeLeft(distance)}`);
    };

    updateText();
    const timer = setInterval(updateText, 1000);
    return () => clearInterval(timer);
  }, []);

  return text;
}

export default useNextBookHolidayText;
