import {outOfRange, assert} from './common.js';
import {Timedelta} from './timedelta.js';

const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const periods = ['AM', 'PM'];
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const fullWeekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

let t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
let weekdayOf = (y, m, d) => {
    y -= m < 3;
    return (y + Math.trunc(y / 4) - Math.trunc(y / 100) + Math.trunc(y / 400) + t[m - 1] + d) % 7;
};

let isLeap = (y) => y % 400 == 0 || (y % 4 == 0 && y % 100 != 0);

let daysOfMonth = (y, m) => days[m - 1] + (m == 2 && isLeap(y));

let dayOf = (y, m, d) => {
    if (isLeap(y) && m > 2) d += 1;
    for (let i = 0; i < m - 1; i++) d += days[i];
    return d;
};

let countDays = (y, m, d) => {
    return (y - 1) * 365 + Math.trunc((y - 1) / 4) - Math.trunc((y - 1) / 100) + Math.trunc((y - 1) / 400) + dayOf(y, m, d);
};

let patternParser = function*(pattern) {
    let begin, end = -1;
    for (let i = 0; i < pattern.length; i++) {
        let chr = pattern[i];
        if (chr == '%') {
            if (end != -1) {
                yield [false, pattern.slice(begin, end)];
                end = -1;
            }
            if (i + 1 == pattern.length) throw new Error('stray %');
            let type = pattern[++i];
            if (type == 'c') {
                yield* patternParser('%a %b %d %H:%M:%S %Y');
            } else if (type == 'x') {
                yield* patternParser('%m/%d/%y');
            } else if (type == 'X') {
                yield* patternParser('%H:%M:%S');
            } else {
                yield [true, type];
            }
        } else {
            if (end == -1) begin = end = i;
            end++;
        }
    }
    if (end != -1) {
        yield [false, pattern.slice(begin, end)];
    }
};

let directive = (datetime, type) => {
    if (type == 'a') {
        return weekdays[datetime.weekday()];
    }
    if (type == 'A') {
        return fullWeekdays[datetime.weekday()];
    }
    if (type == 'w') {
        return datetime.weekday();
    }
    if (type == 'd') {
        let day = datetime.day;
        if (day < 10) day = '0' + day;
        return day;
    }
    if (type == 'b') {
        return months[datetime.month - 1];
    }
    if (type == 'B') {
        return fullMonths[datetime.month - 1];
    }
    if (type == 'm') {
        let month = datetime.month;
        if (month < 10) month = '0' + month;
        return month;
    }
    if (type == 'y') {
        let year = datetime.year % 100;
        if (year < 10) year = '0' + year;
        return year;
    }
    if (type == 'Y') {
        let year = datetime.year;
        if (year < 10) year = '000' + year;
        else if (year < 100) year = '00' + year;
        else if (year < 1000) year = '0' + year;
        return year
    }
    if (type == 'H') {
        let hour = datetime.hour;
        if (hour < 10) hour = '0' + hour;
        return hour;
    }
    if (type == 'I') {
        let hour = (datetime.hour - 1) % 12 + 1;
        if (hour < 10) hour = '0' + hour;
        return hour;
    }
    if (type == 'p') {
        return datetime.hour < 12 ? 'AM' : 'PM';
    }
    if (type == 'M') {
        let minute = datetime.minute;
        if (minute < 10) minute = '0' + minute;
        return minute;
    }
    if (type == 'S') {
        let second = datetime.second;
        if (second < 10) second = '0' + second;
        return second;
    }
    if (type == 'f') {
        let millisecond = datetime.millisecond;
        if (millisecond < 10) millisecond = '00' + millisecond;
        else if (millisecond < 100) millisecond = '0' + millisecond;
        return millisecond;
    }
    if (type == 'z') {
        return '';
    }
    if (type == 'Z') {
        return '';
    }
    if (type == 'j') {
        return dayOf(datetime.year, datetime.month, datetime.day);
    }
    if (type == 'U') {
        let day = dayOf(datetime.year, datetime.month, datetime.day);
        let firstSun = (7 - weekdayOf(datetime.year, 1, 1)) % 7;
        return Math.ceil((day - firstSun) / 7);
    }
    if (type == 'W') {
        let day = dayOf(datetime.year, datetime.month, datetime.day);
        let firstMon = (7 - weekdayOf(datetime.year, 1, 1) + 1) % 7;
        return Math.ceil((day - firstMon) / 7);
    }
    if (type == 'c') {
        return datetime.format('%a %b %d %H:%M:%S %Y');
    }
    if (type == 'x') {
        return datetime.format('%m/%d/%y');
    }
    if (type == 'X') {
        return datetime.format('%H:%M:%S');
    }
    if (type == '%') {
        return '%';
    }
    return '%' + type;
};

let getNumber = (string, position, length, min, max) => {
    if (position + length > string.length) throw new Error('does not match format');
    let n = +string.slice(position, position + length);
    if (outOfRange(n, min, max)) throw new Error('does not match format');
    return n;
};

let getName = (string, position, length, nameList) => {
    let i;
    if (length > 0) {
        if (position + length > string.length) throw new Error('does not match format');
        i = nameList.indexOf(string.slice(position, position + length));
    } else {
        i = nameList.findIndex((name) => string.startsWith(name, position));
    }
    if (i == -1) throw new Error('does not match format');
    return i;
};


function utcOffset() {
    return new Date().getTimezoneOffset() * 60 * 1000;
}

const epochTime = countDays(1970, 1, 1) * 24 * 60 * 60 * 1000 - utcOffset();

function parse(string, pattern) {
    let dt = new Datetime();

    let use12Hour = false;
    let isPM = false;
    let dayOfYear = -1;
    let weekday = -1;
    let weeks = -1;
    let firstWeekday = 0;

    // console.log(Array.from(patternParser(pattern)));

    let i = 0;
    for (let [type, value] of patternParser(pattern)) {
        if (type == true) {
            if (value == 'a') {
                weekday = getName(string, i, 3, weekdays);
                i = i + 3;
            } else if (value == 'A') {
                let index = getName(string, i, -1, fullWeekdays);
                weekday = index;
                i = i + fullWeekdays[index].length;
            } else if (value == 'w') {
                weekday = getNumber(string, i, 1, 0, 6);
                i = i + 1;
            } else if (value == 'd') {
                dt.day = getNumber(string, i, 2, 1, 31);
                i = i + 2;
            } else if (value == 'b') {
                dt.month = getName(string, i, 3, months) + 1;
                i = i + 3;
            } else if (value == 'B') {
                let index = getName(string, i, -1, fullMonths);
                dt.month = index + 1;
                i = i + fullMonths[index].length;
            } else if (value == 'm') {
                dt.month = getNumber(string, i, 2, 1, 12);
                i = i + 2;
            } else if (value == 'y') {
                let year = getNumber(string, i, 2, 0, 99);
                dt.year = (year > 68 ? 1900 : 2000) + year;
                i = i + 2;
            } else if (value == 'Y') {
                dt.year = getNumber(string, i, 4, 1, 9999);
                i = i + 4;
            } else if (value == 'H') {
                dt.hour = getNumber(string, i, 2, 0, 23);
                i = i + 2;

                use12Hour = false;
            } else if (value == 'I') {
                dt.hour = getNumber(string, i, 2, 1, 12) % 12;
                i = i + 2;

                use12Hour = true;
            } else if (value == 'p') {
                let index = getName(string, i, 2, periods);
                i = i + 2;

                isPM = index == 1;
            } else if (value == 'M') {
                dt.minute = getNumber(string, i, 2, 0, 59);
                i = i + 2;
            } else if (value == 'S') {
                dt.second = getNumber(string, i, 2, 0, 59);
                i = i + 2;
            } else if (value == 'f') {
                dt.millisecond = getNumber(string, i, 3, 0, 999);
                i = i + 3;
            } else if (value == 'z') {

            } else if (value == 'Z') {

            } else if (value == 'j') {
                dayOfYear = getNumber(string, i, 3, 1, 366);
                i = i + 3;
            } else if (value == 'U') {
                weeks = getNumber(string, i, 2, 0, 53);
                i = i + 2;

                firstWeekday = 0;
            } else if (value == 'W') {
                weeks = getNumber(string, i, 2, 0, 53);
                i = i + 2;

                firstWeekday = 1;
            } else if (value == '%') {
                if (string[i] != '%') throw new Error('does not match format');
                i = i + 1;
            } else {
                throw new Error('bad directive');
            }
        } else {
            if (!string.startsWith(value, i)) throw new Error('does not match format');
            i += value.length;
        }
    }

    if (isPM && use12Hour) {
        dt.hour += 12;
    }
    if (weeks != -1 && weekday != -1) {
        let firstDay = (7 - weekdayOf(dt.year, 1, 1) + firstWeekday) % 7;
        dayOfYear = (firstDay - 7) % 7 + weeks * 7 + ((weekday - firstWeekday) % 7 + 7) % 7;

        if (dayOfYear < 0) {
            dt.year -= 1;
            dayOfYear += 365 + isLeap(dt.year);
        }
        dayOfYear += 1;
    }
    if (dayOfYear != -1) {
        let month = 1;
        for (; month <= 12; month++) {
            let d = daysOfMonth(dt.year, month);
            if (dayOfYear < d) break;
            dayOfYear -= d;
        }
        dt.month = month;
        dt.day = dayOfYear;
    }

    return dt;
}

export class Datetime {

    static create() {
        if (arguments.length == 1) {
            if (typeof arguments[0] == 'number') return Datetime.fromTimestamp(arguments[0]);
            if (typeof arguments[0] == 'object') {
                if (arguments[0] instanceof Date) return Datetime.fromDate(arguments[0]);
                return Datetime.from(arguments[0]);
            }
        }
        return new Datetime(...arguments);
    }

    static from({
        year = 1,
        month = 1,
        day = 1,
        hour = 0,
        minute = 0,
        second = 0,
        millisecond = 0
    } = {}) {
        return new Datetime(year, month, day, hour, minute, second, millisecond);
    }

    static fromDate(date) {
        return new Datetime(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
    }

    static fromTimestamp(ts) {
        return Datetime.fromDate(new Date(ts));
    }

    static utc(year = 1970, month = 1, day = 1, hour = 0, minute = 0, second = 0, millisecond = 0) {
        return Datetime.fromTimestamp(new Datetime(year, month, day, hour, minute, second, millisecond) - utcOffset());
    }

    static now() {
        return Datetime.fromDate(new Date());
    }

    static parse(string, pattern) {
        return parse(string, pattern);
    }

    #year;
    #month;
    #day;
    #hour;
    #minute;
    #second;
    #millisecond;

    constructor(year = 1, month = 1, day = 1, hour = 0, minute = 0, second = 0, millisecond = 0) {
        this.year = year;
        this.month = month;
        this.day = day;
        this.hour = hour;
        this.minute = minute;
        this.second = second;
        this.millisecond = millisecond;
    }

    get year() {
        return this.#year;
    }
    get month() {
        return this.#month;
    }
    get day() {
        return this.#day;
    }
    get hour() {
        return this.#hour;
    }
    get minute() {
        return this.#minute;
    }
    get second() {
        return this.#second;
    }
    get millisecond() {
        return this.#millisecond;
    }

    set year(n) {
        if (n < 1 || n > 9999) throw new Error('value out of range');
        this.#year = +n;
    }
    set month(n) {
        if (n < 1 || n > 12) throw new Error('value out of range');
        this.#month = +n;
    }
    set day(n) {
        if (n < 1 || n > daysOfMonth(this.year, this.month)) throw new Error('value out of range');
        this.#day = +n;
    }
    set hour(n) {
        if (n < 0 || n > 23) throw new Error('value out of range');
        this.#hour = +n;
    }
    set minute(n) {
        if (n < 0 || n > 59) throw new Error('value out of range');
        this.#minute = +n;
    }
    set second(n) {
        if (n < 0 || n > 59) throw new Error('value out of range');
        this.#second = +n;
    }
    set millisecond(n) {
        if (n < 0 || n > 999) throw new Error('value out of range');
        this.#millisecond = +n;
    }

    replace({
        year = this.year,
        month = this.month,
        day = this.day,
        hour = this.hour,
        minute = this.minute,
        second = this.second,
        millisecond = this.millisecond
    } = {}) {
        this.year = year;
        this.month = month;
        this.day = day;
        this.hour = hour;
        this.minute = minute;
        this.second = second;
        this.millisecond = millisecond;
        // console.log('replace', this.constructor())
        return this;
    }

    isLeap() {
        return isLeap(this.year);
    }

    weekday() {
        return weekdayOf(this.year, this.month, this.day);
    }

    format(pattern) {
        // return pattern.replace(/%(.)/g, (str, type) => this.#directive(type));
        let string = [];
        for (let [type, value] of patternParser(pattern)) {
            if (type == true) {
                string.push(directive(this, value));
            } else {
                string.push(value);
            }
        }
        return string.join('');
    }

    isoformat(sep = 'T') {
        return this.format('%Y-%m-%d' + sep + '%H:%M:%S.%f');
    }

    date() {
        return new Date(this.year, this.month - 1, this.day, this.hour, this.minute, this.second, this.millisecond);
    }

    valueOf() {
        let current = (((countDays(this.year, this.month, this.day) * 24 + this.hour) * 60 + this.minute) * 60 + this.second) * 1000 + this.millisecond;
        return current - epochTime;
    }

    toString() {
        return `Datetime(year=${this.year}, month=${this.month}, day=${this.day}, hour=${this.hour}, minute=${this.minute}, second=${this.second}, millisecond=${this.millisecond})`;
    }

    add(n) {
        return Datetime.fromTimestamp(this + n);
    }

    sub(n) {
        if (typeof n == 'object' && n instanceof Datetime) {
            return Timedelta.fromTimestamp(this - n);
        }
        return Datetime.fromTimestamp(this - n);
    }
}