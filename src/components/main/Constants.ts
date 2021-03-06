export const TimeOfDay: {[time: string]: string}  = {
    AM: 'AM',
    PM: 'PM'
};

export const MonthNames: string[] = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

export const WeekDayNames: string[][] = [
    ['Sunday', 'Sun'],
    ['Monday', 'Mon'],
    ['Tuesday', 'Tues'],
    ['Wednesday', 'Wed'],
    ['Thursday', 'Thurs'],
    ['Friday', 'Fri'],
    ['Saturday', 'Sat']
];

export const ColumnPos: {[position: string]: string} = {
    LEFT: 'calendar-column-left',  // Indicates the left column of a calendar
    MIDDLE: 'calendar-column-middle', // Indicates a center column of a calendar
    RIGHT: 'calendar-column-right'  // Indicates the right column of a calendar
};

export const CalendarTab: {[name: string]: string} = {
    SHARED_CALENDAR: 'cal-tab-shared',
    MY_CALENDAR: 'cal-tab-personal'
};
