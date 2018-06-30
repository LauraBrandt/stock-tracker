import * as cdh from '../../../lib/chartDataHelper';

describe('pad', () => {
  it('returns the number if >= 10', () => {
    const number = 10
    const result = cdh.pad(number);
    expect(result).toBe(number);
  });

  it('returns zero-padded number if < 10', () => {
    const number = 9
    const result = cdh.pad(number);
    expect(result).toBe('09');
  });
});

describe('formatDate', () => {
  it('returns correctly formatted date', () => {
    const date = new Date('Jan 9, 2018');
    const result = cdh.formatDate(date);
    expect(result).toBe('2018-01-09');
  });
});

describe('getDateRange', () => {
  const originalDateNow = Date.now;

  beforeAll(() => {
    const now = 1480000000000; // 2016-11-24
    Date.now = jest.fn().mockReturnValue(now);
  });

  afterAll(() => {
    Date.now = originalDateNow;
  });

  it('ytd happy path', () => {
    const expected = [
      '2016-01-01',
      '2016-11-24'
    ]
    const period = 'ytd';
    const result = cdh.getDateRange(period);
    expect(result).toEqual(expected);
  });

  it('3m period happy path', () => {
    const expected = [
      '2016-08-24',
      '2016-11-24'
    ]
    const period = '3m';
    const result = cdh.getDateRange(period);
    expect(result).toEqual(expected);
  });

  it('2y period happy path', () => {
    const expected = [
      '2014-11-24',
      '2016-11-24'
    ]
    const period = '2y';
    const result = cdh.getDateRange(period);
    expect(result).toEqual(expected);
  });

  it('calculates correct month when extending to previous year', () => {
    Date.now = jest.fn().mockReturnValue(1490000000000); // 2017-03-20
    const expected = [
      '2016-09-20',
      '2017-03-20'
    ]
    const period = '6m';
    const result = cdh.getDateRange(period);
    expect(result).toEqual(expected);
  });

  it('calculates year range correctly for leap days', () => {
    Date.now = jest.fn().mockReturnValue(1456704000000); // 2016-02-29
    const expected = [
      '2015-03-01',
      '2016-02-29'
    ]
    const period = '1y';
    const result = cdh.getDateRange(period);
    expect(result).toEqual(expected);
  });

  it('calculates date correctly for months with different numbers of days', () => {
    Date.now = jest.fn().mockReturnValue(1464652800000); // 2016-05-31
    const expected = [
      '2016-05-01',
      '2016-05-31'
    ]
    const period = '1m';
    const result = cdh.getDateRange(period);
    expect(result).toEqual(expected);
  });

  it('when period invalid, returns error', () => {
    const expected = 'Invalid period';
    
    const period = 'ab';
    const result = cdh.getDateRange(period);

    expect(result instanceof Error).toBe(true);
    expect(result.message).toEqual(expected);
  });
});

describe('getDatePeriod', () => {
  const originalDateNow = Date.now;

  beforeAll(() => {
    const now = 1490000000000; // 2017-03-20
    Date.now = jest.fn().mockReturnValue(now);
  });

  afterAll(() => {
    Date.now = originalDateNow;
  });

  it('> 2y difference returns 5y', () => {
    const startDate = new Date('2015-03-19');
    const result = cdh.getDatePeriod(startDate);
    expect(result).toBe('5y');
  });

  it('> 1y difference returns 2y', () => {
    let startDate = new Date('2015-03-20');
    let result = cdh.getDatePeriod(startDate);
    expect(result).toBe('2y');

    startDate = new Date('2016-03-19');
    result = cdh.getDatePeriod(startDate);
    expect(result).toBe('2y');
  });

  it('> 6m difference returns 1y', () => {
    let startDate = new Date('2016-03-20');
    let result = cdh.getDatePeriod(startDate);
    expect(result).toBe('1y');

    startDate = new Date('2016-09-19');
    result = cdh.getDatePeriod(startDate);
    expect(result).toBe('1y');
  });

  it('> 3m difference returns 6m', () => {
    let startDate = new Date('2016-09-20');
    let result = cdh.getDatePeriod(startDate);
    expect(result).toBe('6m');

    startDate = new Date('2016-12-19');
    result = cdh.getDatePeriod(startDate);
    expect(result).toBe('6m');
  });

  it('> 1m difference returns 3m', () => {
    let startDate = new Date('2016-12-20');
    let result = cdh.getDatePeriod(startDate);
    expect(result).toBe('3m');

    startDate = new Date('2017-02-19');
    result = cdh.getDatePeriod(startDate);
    expect(result).toBe('3m');
  });

  it('<= 1m difference returns 1m', () => {
    let startDate = new Date('2017-02-20');
    let result = cdh.getDatePeriod(startDate);
    expect(result).toBe('1m');

    startDate = new Date('2017-03-19');
    result = cdh.getDatePeriod(startDate);
    expect(result).toBe('1m');
  });
});

describe('validateDate', () => {
  const originalDateNow = Date.now;

  let start, end;
  beforeAll(() => {
    const now = 1490000000000; // 2017-03-20
    Date.now = jest.fn().mockReturnValue(now);

    start = '2017-01-01';
    end = '2017-03-20';
  });

  afterAll(() => {
    Date.now = originalDateNow;
  });

  it('happy path new start date', () => {
    const id = 'from';
    const value = '2017-01-20';

    const expected = { success: true }

    const result = cdh.validateDate(id, value, start, end);
    
    expect(result).toEqual(expected);
  });
  
  it('happy path new end date', () => {
    const id = 'to';
    const value = '2017-02-20';

    const expected = { success: true }

    const result = cdh.validateDate(id, value, start, end);
    
    expect(result).toEqual(expected);
  });

  it('not valid date format', () => {
    const id = 'from';
    const value = 'abc';

    const expected = { 
      success: false,
      error: 'Value must be a date'
    }

    const result = cdh.validateDate(id, value, start, end);
    expect(result).toEqual(expected);
  });

  it('end date is after current date', () => {
    const id = 'to';
    const value = '2017-03-21';

    const expected = { 
      success: false,
      error: "End date must not be after today's date"
    }

    const result = cdh.validateDate(id, value, start, end);
    expect(result).toEqual(expected);
  });

  it('start date is 5 years ago (success)', () => {
    const id = 'from';
    const value = '2012-03-20';

    const expected = { success: true }

    const result = cdh.validateDate(id, value, start, end);
    expect(result).toEqual(expected);
  });
  
  it('start date is more than 5 years ago', () => {
    const id = 'from';
    const value = '2012-03-19';

    const expected = { 
      success: false,
      error: "Start date must be within the last 5 years"
    }

    const result = cdh.validateDate(id, value, start, end);
    expect(result).toEqual(expected);
  });
  
  it('new start date is equal to end date', () => {
    const id = 'from';
    const value = '2017-03-20';

    const expected = { 
      success: false,
      error: 'Start date must be before end date'
    }

    const result = cdh.validateDate(id, value, start, end);
    expect(result).toEqual(expected);
  });

  it('new start date is after end date', () => {
    const id = 'from';
    const value = '2018-03-20';

    const expected = { 
      success: false,
      error: 'Start date must be before end date'
    }

    const result = cdh.validateDate(id, value, start, end);
    expect(result).toEqual(expected);
  });

  it('new end date is equal to start date', () => {
    const id = 'to';
    const value = '2017-01-01';

    const expected = { 
      success: false,
      error: 'Start date must be before end date'
    }

    const result = cdh.validateDate(id, value, start, end);
    expect(result).toEqual(expected);
  });

  it('new end date is before start date', () => {
    const id = 'to';
    const value = '2016-01-01';

    const expected = { 
      success: false,
      error: 'Start date must be before end date'
    }

    const result = cdh.validateDate(id, value, start, end);
    expect(result).toEqual(expected);
  });
});

describe('getChartData', () => {
  let symbols, stocks, startDate, endDate;

  beforeEach(() => {
    symbols = ['FB', 'AAPL'];

    stocks = {
      'FB': {
        chart: [
          {"date": "2018-06-01", close: 101},
          {"date": "2018-06-02", close: 102},
          {"date": "2018-06-03", close: 103},
          {"date": "2018-06-04", close: 104},
          {"date": "2018-06-05", close: 105}
        ]
      },
      'AAPL': {
        chart: [
          {"date": "2018-06-01", close: 201},
          {"date": "2018-06-02", close: 202},
          {"date": "2018-06-03", close: 203},
          {"date": "2018-06-04", close: 204},
          {"date": "2018-06-05", close: 205}
        ]
      }
    }

    startDate = '2018-06-01';
    endDate = '2018-06-05';
  });

  it('creates chartData array with correct data, skipping weekends', () => {
    const expected = [
      {"date": "2018-06-01", label: "Fri, 01 Jun 2018", FB: 101, AAPL: 201},
      {"date": "2018-06-04", label: "Mon, 04 Jun 2018", FB: 104, AAPL: 204},
      {"date": "2018-06-05", label: "Tue, 05 Jun 2018", FB: 105, AAPL: 205}
    ]

    const result = cdh.getChartData(symbols, stocks, startDate, endDate);
    
    expect(result).toEqual(expected);
  });

  it("creates chartData array correctly even when chart dates don't correspond to date range", () => {
    stocks.AAPL.chart = [
      {"date": "2018-05-31", close: 200},
      {"date": "2018-06-01", close: 201},
      {"date": "2018-06-02", close: 202},
      {"date": "2018-06-04", close: 204},
      {"date": "2018-06-06", close: 205}
    ]

    const expected = [
      {"date": "2018-06-01", label: "Fri, 01 Jun 2018", FB: 101, AAPL: 201},
      {"date": "2018-06-04", label: "Mon, 04 Jun 2018", FB: 104, AAPL: 204},
      {"date": "2018-06-05", label: "Tue, 05 Jun 2018", FB: 105}
    ]

    const result = cdh.getChartData(symbols, stocks, startDate, endDate);
    
    expect(result).toEqual(expected);
  });
});
