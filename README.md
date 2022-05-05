# DatetimeJs
Python-like datetime class with formatter and parser

## Installation
```
npm i python-datetime
```
For browser, download index.js and rename it to e.g.: datetime.js.

## Usage
### CommonJS
```
const {Datetime, Timedelta} = require('python-datetime');
```

### ES6 module (adding `type: "module"` to package.json)
```
import {Datetime, Timedelta} from 'python-datetime';
```

### Browser
```
<script src="./index.js"></script>
```
or check test.html for simple usage

## Syntax
```
new Datetime(year, month, day, hour, minute, second, millisecond);
new Timedelta(days, hours, minutes, seconds, milliseconds);
```
## Parameters
Check https://docs.python.org/3/library/datetime.html.
Or check Examples below.

## Examples

### now() and toString()
```
Datetime.now().toString()
```
> 'Datetime(year=2022, month=5, day=5, hour=12, minute=10, second=16, millisecond=258)'

### .format(formatString)
```
let dt = new Datetime(2345, 5, 16, 17, 28, 39, 10);

dt.format('%a %A %w %d %b %B %m %y %Y %H %I %p %M %S %j %U %W %c %x %X %% ')
```
> 'Wed Wednesday 3 16 May May 05 45 2345 17 05 PM 28 39 136 19 20 Wed May 16 17:28:39 2345 05/16/45 17:28:39 % '

### timestamp (valueOf())
```
console.log(+Datetime.now());
+Datetime.now() == Date.now()
```
> 1651724057047
> true

### fromTimestamp(ts)
```
Datetime.fromTimestamp(Date.now()).toString()
```
> 'Datetime(year=2022, month=5, day=5, hour=12, minute=15, second=5, millisecond=728)'

### utc(year, month, day, hour, minute, second, millisecond)
```
Datetime.utc(1234, 6, 6).toString()
```
> 'Datetime(year=1234, month=6, day=6, hour=7, minute=36, second=42, millisecond=0)'

### from({year, month, day, hour, minute, second, millisecond})
```
Datetime.from(Datetime.now()).toString()
```
> 'Datetime(year=2022, month=5, day=5, hour=12, minute=22, second=59, millisecond=359)'

### fromDate(date)
```
Datetime.fromDate(new Date()).toString()
```
> 'Datetime(year=2022, month=5, day=5, hour=12, minute=23, second=47, millisecond=414)'

### .create(args)
```
let date = new Date();
let a = Datetime.create(Datetime.fromDate(date)).toString();
let b = Datetime.create(date).toString();
let c = Datetime.create(+date).toString();

a == b && b == c
```

> true

### isoformat(sep = 'T')
```
new Datetime(2022, 1, 2, 3, 4, 5, 6).isoformat('XD')
```

> '2022-01-02XD03:04:05.006'

### parse(dateString, formatString)
```
Datetime.parse('31 Sun 2021', '%W %a %Y').format('%c')
```

> 'Sun Aug 08 00:00:00 2021'

```
Datetime.parse('@@ Tue Aug 16 21:30:00 1988 --', '@@ %c --').format('%c')
```

> 'Tue Aug 16 21:30:00 1988'

```
Datetime.parse('21:30:00', '%X').format('%X')
```

> '21:30:00'

```
Datetime.parse('@@ Tue Aug 16 21:30:00 1988 --', '@@ %c --').isoformat()
```

> '1988-08-16T21:30:00.000'

#### %j directive (number of days since the beginning of the year)
```
Datetime.parse('2022 115', '%Y %j').format('%c')
```

> 'Mon Apr 25 00:00:00 2022'


### date()
```
Datetime.now().date().getTime() == new Date().getTime()
```

> true

### replace({year, month, day, hour, minute, second, millisecond})
```
Datetime.create(1234567).replace({year: 2022}).isoformat()
```

> '2022-01-01T08:20:34.567'

### Timedelta
```
Timedelta.create(Datetime.create(2022, 4, 25) - Datetime.create(2021, 4, 25)).toString()
```

> 'Timedelta(days=365, hours=0, minutes=0, seconds=0, milliseconds=0)'

#### Leap year
```
Timedelta.create(Datetime.create(2021, 2, 1) - Datetime.create(2020, 2, 1)).toString()
```

> 'Timedelta(days=366, hours=0, minutes=0, seconds=0, milliseconds=0)'

### add() sub()
```
Datetime.create(2022, 4, 25).add(new Timedelta(1, 2)).toString()
```

> 'Datetime(year=2022, month=4, day=26, hour=2, minute=0, second=0, millisecond=0)'

### operators
```
new Timedelta(1, 2).mul(2)
```

> 'Timedelta(days=2, hours=4, minutes=0, seconds=0, milliseconds=0)'

```
Timedelta.create(new Timedelta(1, 2) * 10)
```
> 'Timedelta(days=10, hours=20, minutes=0, seconds=0, milliseconds=0)'
