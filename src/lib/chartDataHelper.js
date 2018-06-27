const pad = num => {
  if (num < 10) {
    return `0${num}`;
  }
  return num;
}

const formatDate = date => {
  return`${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
}

export const getDateRange = period => {
  const endDate = new Date();
  let startDate = new Date(endDate);

  const unit = period.slice(1);
  const amount = parseInt(period.slice(0,1), 10);

  if (period === 'ytd') {
    startDate.setMonth(0); // January
    startDate.setDate(1); // 1st
  } else if (unit === 'y') {
    startDate.setFullYear(startDate.getFullYear() - amount);
  } else if (unit === 'm') {
    const month = (startDate.getMonth() - amount) % 12;
    startDate.setMonth(month);
  } else {
    return Error('Invalid period');
  }

  return [formatDate(startDate), formatDate(endDate)];
}

export const getDatePeriod = (startDate) => {
  const now = new Date();
  const start = new Date(startDate);

  const compareDate = new Date(now);

  compareDate.setFullYear(now.getFullYear() - 2); // two years ago
  if (start.getTime() < compareDate.getTime() && formatDate(compareDate) !== formatDate(start)) {
    return '5y';
  }

  compareDate.setFullYear(now.getFullYear() - 1); // one year ago
  if (start.getTime() < compareDate.getTime() && formatDate(compareDate) !== formatDate(start)) {
    return '2y';
  }

  compareDate.setFullYear(now.getFullYear());
  compareDate.setMonth((now.getMonth() - 6) % 12); // six months ago
  if (start.getTime() < compareDate.getTime() && formatDate(compareDate) !== formatDate(start)) {
    return '1y';
  }

  compareDate.setFullYear(now.getFullYear());
  compareDate.setMonth((now.getMonth() - 3) % 12); // three months ago
  if (start.getTime() < compareDate.getTime() && formatDate(compareDate) !== formatDate(start)) {
      return '6m';
  }

  compareDate.setFullYear(now.getFullYear());
  compareDate.setMonth((now.getMonth() - 1) % 12);
  if (start.getTime() < compareDate.getTime() && formatDate(compareDate) !== formatDate(start)) {
      return '3m';
  }

      return '1m';
    }

export const validateDate = (id, value, start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const valueDate = new Date(value);

  // valid date format
  if (valueDate == 'Invalid Date') {
    return {
      success: false,
      error: 'Value must be a date'
    }
  } 

  // end date is not after current date
  if (id === 'to' && valueDate.getTime() > Date.now()) {
    return {
      success: false,
      error: "End date must not be after today's date"
    }
  }

  // start date is no more than 5 years ago
  const now = new Date(Date.now());
  const fiveYearsAgo = new Date(now);
  fiveYearsAgo.setFullYear(now.getFullYear() - 5);
  if (id === 'from' && valueDate.getTime() < fiveYearsAgo.getTime() && formatDate(valueDate) !== formatDate(fiveYearsAgo)) {
    return {
      success: false,
      error: "Start date must be within the last 5 years"
    }
  }

  // start date is before end date
  if ( (id === 'from' && valueDate.getTime() >= endDate.getTime()) ||
       (id === 'to' && valueDate.getTime() <= startDate.getTime()) ) {
    return {
      success: false,
      error: 'Start date must be before end date'
    }
  }

  return { success: true }
}

export const getChartData = (symbols, stocks, startDate, endDate) => {
  const msInDay = 86400000;
  let stockData = [];

  // create list of objects for each date in date range
  let currentDate  = new Date(startDate);
  endDate = new Date(endDate);
  while (currentDate.getTime() <= endDate.getTime()) {
    if (currentDate.getUTCDay() !== 0 && currentDate.getUTCDay() !== 6) { // don't include weekends
      stockData.push({
        date: formatDate(currentDate),
        label: currentDate.toUTCString().slice(0,16)
      });
    }
    currentDate.setTime(currentDate.getTime() + msInDay);
  }

  // loop through each of the stocks
  let current;
  for (let i=0; i<symbols.length; i++) {
    current = symbols[i];
    // for each stock, add that stock's data to the corresponding element (by date) in stockData
    // eslint-disable-next-line
    stocks[current].chart.forEach(chartElement => {
      const index = stockData.findIndex(dayObject => dayObject.date === chartElement.date);
      if (index !== -1) {
        stockData[index][current] = chartElement.close;
      }
    });
  }

  return stockData;
}

