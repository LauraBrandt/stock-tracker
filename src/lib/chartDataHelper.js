const msInYear = 31556952000;
const msInMonth = 2592000;
const msInDay = 86400000;

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
  }

  return [formatDate(startDate), formatDate(endDate)];
}

export const getDatePeriod = (startDate) => {
  const now = new Date();
  const start = new Date(startDate);

  const diff = Math.abs(now - start);
  let years = diff / msInYear;
  if (years > 2) {
    return '5y';
  } else if (years > 1) {
    return '2y';
  } else if (years === 1) {
    return '1y';
  } else {
    const months = Math.floor(diff / msInMonth);
    if (months > 6) {
      return '1y';
    } else if (months > 3) {
      return '6m';
    } else if (months > 1) {
      return '3m';
    } else {
      return '1m';
    }
  }
}

export const validateDate = (id, value, start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const valueDate = new Date(value);

  // valid date format
  if (valueDate === 'Invalid Date') {
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
  if (id === 'from' && valueDate.getTime() + (5*msInYear) < Date.now()) {
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

