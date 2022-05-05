import {divmod} from './common.js';

export class Timedelta {

    static create() {
        if (arguments.length == 1) {
            if (typeof arguments[0] == 'number') return Timedelta.fromTimestamp(arguments[0]);
            if (typeof arguments[0] == 'object') return Timedelta.from(arguments[0]);
        }
        return new Timedelta(...arguments);
    }

    static from({
        days = 0,
        hours = 0,
        minutes = 0,
        seconds = 0,
        milliseconds = 0
    } = {}) {
        return new Timedelta(days, hours, minutes, seconds, milliseconds);
    }

    static fromTimestamp(ts) {
        let days, hours, minutes, seconds, milliseconds;
        ts = Math.trunc(ts);
        [ts, milliseconds] = divmod(ts, 1000);
        [ts, seconds] = divmod(ts, 60);
        [ts, minutes] = divmod(ts, 60);
        [ts, hours] = divmod(ts, 24);
        days = ts;
        return new Timedelta(days, hours, minutes, seconds, milliseconds);
    }

    constructor(days = 0, hours = 0, minutes = 0, seconds = 0, milliseconds = 0) {
        this.days = days;
        this.hours = hours;
        this.minutes = minutes;
        this.seconds = seconds;
        this.milliseconds = milliseconds;
    }

    valueOf() {
        return (((this.days * 24 + this.hours) * 60 + this.minutes) * 60 + this.seconds) * 1000 + this.milliseconds;
    }

    toString() {
        return `Timedelta(days=${this.days}, hours=${this.hours}, minutes=${this.minutes}, seconds=${this.seconds}, milliseconds=${this.milliseconds})`
    }

    add(n) {
        return Timedelta.fromTimestamp(this + n);
    }

    sub(n) {
        return Timedelta.fromTimestamp(this - n);
    }

    mul(n) {
        return Timedelta.fromTimestamp(this * n);
    }

    div(n) {
        if (typeof n == 'object' && n instanceof Timedelta) {
            return this / n;
        }
        return Timedelta.fromTimestamp(this / n);
    }

    mod(n) {
        return Timedelta.fromTimestamp(this % n);
    }

    neg() {
        return Timedelta.fromTimestamp(-this);
    }
}