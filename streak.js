const streakCount = document.getElementById('streak-count');
const longestStreak = document.getElementById('streak-longest');
const streakMessage = document.getElementById('streak-message');
const markRead = document.getElementById('mark-read');
const clearHistoryButton = document.getElementById('clear-history-button');
const calPrevMonth = document.getElementById('prev-month');
const calNextMonth = document.getElementById('next-month');
const calMonthLabel = document.getElementById('month-label');
const todayButton = document.getElementById('today-button');
const cal = document.getElementById('cal-grid');
const readDaysKey = "bibleReadDays";

// Load stored read days if available, otherwise, use an empty object
let readDays = JSON.parse(localStorage.getItem(readDaysKey)) || {};

let currentDate = new Date();

function renderCalendar() {
    // Get relevant calendar data
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // Zero-based array of months (January is 0)
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // "0th" date of the next month (last date of this month)
    const startDay = new Date(year, month, 1).getDay(); // Zero-based array of weekdays (Sunday is 0)

    // Clear existing cells (except labels)
    const dayCells = cal.querySelectorAll('div:not(.cal-label)');
    dayCells.forEach(cell => cal.removeChild(cell));

    // Update the month label to display the correct month and year
    calMonthLabel.textContent = `${currentDate.toLocaleString('default', { month: 'long'})} ${year}`;

    const dayCellsArray = []; // Empty array to hold day cells

    // Today's date in YYYY-MM-DD format (needs to be called here because currentDate might have been changed)
    const today = new Date();
    const todayStr = getLocalDateString(today);

    let isTodayRead = false;

    // Add empty cells before the first day of the month
    for (let i = 0; i < startDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('empty');
        dayCellsArray.push(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day); // Create date object with references to year, month, date
        const dateStr = getLocalDateString(date); // Generate a YYYY-MM-DD format date string

        const dayCell = document.createElement('div'); // Create new day div
        dayCell.dataset.date = dateStr; // Set data-date attribute on divs with the YYYY-MM-DD formate date string
        const span = document.createElement('span');
        span.textContent = day; // Set the day number
        dayCell.appendChild(span);

        // Check if this day is today
        if (dateStr === todayStr) {
            dayCell.classList.add('today'); // Add class to higlight today
        }

        // Check if this day was previously marked read
        if (readDays[dateStr]) {
            dayCell.classList.add('read');
        }

        // Only allow clicking for today and past dates
        if (date <= today) {
            dayCell.addEventListener('click', () => {
                dayCell.classList.toggle('read');

                // If the day is now read (has the 'read' class), mark it as read in localStorage
                if (dayCell.classList.contains('read')) {
                    readDays[dateStr] = true;
                } else {
                    // If the day is now unread, remove it from readDays in localStorage
                    delete readDays[dateStr];
                }

                // Save updated readDays object to localStorage
                localStorage.setItem(readDaysKey, JSON.stringify(readDays));

                // Re-render calendar to update visual state
                renderCalendar();
                calculateCurrentStreak();
            });
        }

        if (dateStr === todayStr && readDays[dateStr]) {
            isTodayRead = true;
        }

        dayCellsArray.push(dayCell); // Add the day div with day number to the array
    }

    dayCellsArray.forEach(cell => cal.appendChild(cell)); // Append day cells to the calendar

    const calendarIsOnToday = (
        currentDate.getFullYear() === today.getFullYear() &&
        currentDate.getMonth() ===today.getMonth()
    );
    markRead.disabled = isTodayRead || !calendarIsOnToday;
}

function calculateCurrentStreak() {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    let streak = 0;

    // Start with today, but if it's not read, go back until we find the most recent read day
    let current = new Date(yesterday);

    // This while loop starts with today and goes backwards. If there are no read days in the last year, it breaks and assumes there are none.
    while (true) {
        const dateStr = getLocalDateString(current);

        if (readDays[dateStr]) { // If this day is marked as read
            streak++;
            current.setDate(current.getDate() - 1);
        } else {
            break;
        }
        
        // This block is a check to make sure the while loop eventually breaks (if no readings are found in the last year)
        const earliestPossible = new Date(today);
        earliestPossible.setFullYear(today.getFullYear() - 1);
        if (current < earliestPossible) {
            streakCount.textContent = "0";
            streakMessage.textContent = "No recent readings. Start your streak!";
            break;
        }
    }

    const todayStr = getLocalDateString(today);
    if (readDays[todayStr]) {
        streak++;
    }

    streakCount.textContent = streak + "🔥";
    calculateLongestStreak();
}

function calculateLongestStreak() {
    const readDates = Object.keys(readDays)
        .map(dateStr => new Date(dateStr))
        .sort((a, b) => a - b);

    let longest = 0;
    let currentStreak = 0;
    let prevDate = null;

    for (let date of readDates) {
        if (prevDate) {
            const diff = (date - prevDate) / (1000 * 60 * 60 * 24); // Difference in days
            if (diff === 1) {
                currentStreak++;
            } else {
                currentStreak = 1;
            }
        } else {
            currentStreak = 1;
        }

        if (currentStreak > longest) {
            longest = currentStreak;
        }

        prevDate = date;
    }

    longestStreak.textContent = longest + "🔥";
}

function getLocalDateString(date) {
    const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return offsetDate.toISOString().split('T')[0];
}

// Mark today as read
markRead.addEventListener('click', () => {
    const today = new Date();
    const todayStr = getLocalDateString(today);

    readDays[todayStr] = true;
    localStorage.setItem(readDaysKey, JSON.stringify(readDays));

    renderCalendar();
    calculateCurrentStreak();
});

// Navigate to the previous month
calPrevMonth.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1); // Go to the previous month
    renderCalendar(); // Re-render calendar
});

// Navigate to the next month
calNextMonth.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1); // Go to the next month
    renderCalendar(); // Re-render calendar
});

// Navigate to the current month
todayButton.addEventListener('click', () => {
    currentDate = new Date();
    renderCalendar();
});

// Check if Alt is pressed
document.addEventListener('keydown', (e) => {
    if (e.altKey) {
        clearHistoryButton.classList.remove('hidden');
    }
});

// Check if a key is released
document.addEventListener('keyup', () => {
    clearHistoryButton.classList.add('hidden');
});

clearHistoryButton.addEventListener('click', () => {
    const confirmed = confirm("Are you sure you want to remove all daily Bible reading history?");

    clearHistoryButton.classList.add('hidden');

    if (confirmed) {
        localStorage.removeItem('bibleReadDays');
        readDays = {};
        renderCalendar();
        calculateCurrentStreak();
    }
});

document.getElementById('collapse-cal').addEventListener('click', (e) => {
    if (e.target.textContent === '˄') {
        document.getElementById('bibleReadingStreak').classList.add('collapsed');
        e.target.textContent = '˅';
    } else {
        document.getElementById('bibleReadingStreak').classList.remove('collapsed');
        e.target.textContent = '˄';
    }
});

renderCalendar();
calculateCurrentStreak();