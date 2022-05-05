// import {Datetime, Timedelta} from './index.js';
const {Datetime, Timedelta} = require('./index.js');
console.log(Datetime, Timedelta);

let debug = 1;

if (debug) {
	let passed = 0, total = 0;
	let assert = (name, actual, expected = true, equals = (x, y) => x == y) => {
		let result = equals(actual, expected);
		(result ? console.log : console.error)('assert', name, ':', result, '\n\tactual', actual, '\n\texpected', expected);
		total++;
		if(result) passed++;
	};
	
    let equals = (x, y) => +x == +y;
    let always = (value) => () => value;
    let dt;

    dt = Datetime.now().replace({
        millisecond: 0
    });
    assert('%c', dt, Datetime.parse(dt.format('%c'), '%c'), equals);

    assert('timestamp', +Datetime.now(), Date.now(), equals);

    assert('fromTimestamp', Datetime.now(), Datetime.fromTimestamp(Date.now()), equals);

    assert('utc', Datetime.utc(1234, 6, 6), Datetime.fromTimestamp(Date.UTC(1234, 5, 6)), equals);

    dt = Datetime.create(2022, 4, 25, 4, 37, 16, 357);
    assert('format', dt.format('(%Y-%m-%d (%a) %H:%M:%S %p)'), '(2022-04-25 (Mon) 04:37:16 AM)');

    dt = new Datetime(2345, 5, 16, 17, 28, 39, 10);
    assert(
        'long format',
        dt.format('%a %A %w %d %b %B %m %y %Y %H %I %p %M %S %j %U %W %c %x %X %% '),
        'Wed Wednesday 3 16 May May 05 45 2345 17 05 PM 28 39 136 19 20 Wed May 16 17:28:39 2345 05/16/45 17:28:39 % '
    );

    assert('format', Datetime.now().format('%a %A %w %d %b %B %m %y %Y %H %I %p %M %S %f %z %Z %j %U %W %c %x %X %%'), null, always(true));

    assert('parse', Datetime.parse('-April4b4MondayaSat%69/2022 115', '-%B4b4%Aa%a%%%y/%Y %j'), Datetime.create(2022, 4, 25), equals);
    assert('parse', Datetime.parse('31 Sun 2021', '%W %a %Y').format('%c'), 'Sun Aug 08 00:00:00 2021');
    assert('parse', Datetime.parse('@@ Tue Aug 16 21:30:00 1988 --', '@@ %c --').format('%c'), 'Tue Aug 16 21:30:00 1988');
    assert('parse', Datetime.parse('21:30:00', '%X').format('%X'), '21:30:00');
    assert('parse', Datetime.parse('@@ Tue Aug 16 21:30:00 1988 --', '@@ %c --').isoformat(), '1988-08-16T21:30:00.000');

    assert('date()', new Date().getTime(), Datetime.now().date().getTime());

    assert('replace()', Datetime.create(1234567).replace(Datetime.now()), Date.now(), equals);

    assert('Timedelta', Timedelta.create(Datetime.create(2022, 4, 25) - Datetime.create(2022, 4, 25).replace({
        month: 3
    })).add(Timedelta.create({
        days: 31
    }).neg()), 0, equals);
    assert('Timedelta', Timedelta.create({
        hours: 4,
        minutes: 39
    }).div(Timedelta.create({
        hours: 1
    })), 4.65);
    assert('Timedelta', Timedelta.create({
        hours: 4,
        minutes: 39
    }).div(12.3), Timedelta.create({
        seconds: 1360,
        milliseconds: 975
    }), equals);

    assert('sub', Datetime.now().sub(Datetime.now().sub(Timedelta.create({
        hours: 1
    }))), Timedelta.create({
        minutes: 59,
        seconds: 60
    }), equals);
    assert('sub', Datetime.now().sub(Timedelta.create({
        hours: 1
    })).format('%c'), null, always(true));

    assert('compare', +new Datetime(2022, 4, 28) == +new Datetime(2022, 4, 28), true);
    assert('compare', new Datetime(2022, 4, 28) >= new Datetime(2022, 4, 28) + 1, false);

    assert('add', Datetime.now().add(Timedelta.create({
        days: -4 * 365,
        hours: 1,
        minutes: 39
    })).toString(), null, always(true));

    let expects = [
        '2020 115 16 16',
        '2021 114 16 16',
        '2022 114 17 16',
        '2023 114 17 17',
        '2024 115 16 17',
        '2025 114 16 16',
        '2026 114 16 16',
        '2027 114 16 16',
        '2028 115 17 17',
        '2029 114 16 17',
    ];
    for (let i = 2020, j = 0; i < 2030; i++, j++) {
        assert('%Y %j %U %W', new Datetime(i, 4, 24, 5, 6, 7).format('%Y %j %U %W'), expects[j]);
    }
	
	console.log();
	console.log(`Test case (total / pass): ${total} / ${passed}`);
}