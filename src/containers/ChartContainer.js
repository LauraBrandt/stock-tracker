import React from 'react';
import PropTypes from 'prop-types';
import ChartControls from '../components/ChartControls';
import Chart from '../components/Chart';
import TableSR from '../components/TableSR';
import { getDateRange, validateDate, getDatePeriod, getChartData } from '../lib/chartDataHelper';
import '../styles/ChartContainer.css';

class ChartContainer extends React.Component {
  constructor() {
    super();

    this.state = {
      stocks: {},
      periods: ['5y', '2y', '1y', 'ytd', '6m', '3m', '1m'],
      currentPeriod: '3m',
      startDate: '',
      endDate: '',
      dateError: '',
      chartData: []
    }

    this.callFetch = this.callFetch.bind(this);
    this.handlePeriodChange = this.handlePeriodChange.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
  }

  componentDidMount() {
    const currentPeriod = sessionStorage.getItem('period');
    let startDate = sessionStorage.getItem('startDate');
    let endDate = sessionStorage.getItem('endDate');

    if (currentPeriod) {
      [startDate, endDate] = getDateRange(currentPeriod);
      this.setState({ 
        currentPeriod,
        startDate,
        endDate
      });
    } else if (startDate && endDate) {
      this.setState({
        currentPeriod: '',
        startDate,
        endDate
      });
    } else {
      const [startDate, endDate] = getDateRange(this.state.currentPeriod);
      this.setState({ startDate, endDate });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.stockSymbols.length > 0 && JSON.stringify(nextProps.stockSymbols) !== JSON.stringify(this.props.stockSymbols)) {
      let period = sessionStorage.getItem('period');
      const startDate = sessionStorage.getItem('startDate');
      const endDate = sessionStorage.getItem('endDate');
  
      if (!period) {
        if (startDate && endDate) {
          period = getDatePeriod(startDate);
        } else {
          period = this.state.currentPeriod;
        }
      }

      this.callFetch(nextProps.stockSymbols, period);
    }
  }

  callFetch(stockSymbols, period) {
    fetch(`https://api.iextrading.com/1.0/stock/market/batch?types=chart&range=${period}&symbols=${stockSymbols.join(',')}`)
    .then(response => response.json())
    .then(stocks => {
      const chartData = getChartData(stockSymbols, stocks, this.state.startDate, this.state.endDate);
      this.setState({ 
        stocks,
        chartData
      });
      if (period.slice(1) === 'y') {
        this.refs.chart.scrollLeft = this.refs.chart.scrollWidth;
      }
    })
      .catch(err => console.log(err));
  }

  handlePeriodChange(e) {
    const currentPeriod = e.target.name;
    const [startDate, endDate] = getDateRange(currentPeriod);

    sessionStorage.setItem('period', currentPeriod);
    sessionStorage.setItem('startDate', '');
    sessionStorage.setItem('endDate', '');

    this.setState({ 
      currentPeriod,
      startDate,
      endDate
    });
    
    this.callFetch(this.props.stockSymbols, currentPeriod);
  }

  handleDateChange(e) {
    const validation = validateDate(e.target.id, e.target.value, this.state.startDate, this.state.endDate);

    if (validation.error) {
      this.setState({ dateError: validation.error });
      return;
    } else {
      this.setState({ dateError: '' });
    }

    if (e.target.id === 'from') {
      sessionStorage.setItem('startDate', e.target.value);
      sessionStorage.setItem('endDate', this.state.endDate);
      sessionStorage.setItem('period', '');
      
      this.setState({ startDate: e.target.value, currentPeriod: '' });
      const relevantPeriod = getDatePeriod(e.target.value);
      this.callFetch(this.props.stockSymbols, relevantPeriod);

    } else if (e.target.id === 'to') {
      sessionStorage.setItem('startDate', this.state.startDate);
      sessionStorage.setItem('endDate', e.target.value);
      sessionStorage.setItem('period', '');
      
      const chartData = getChartData(this.props.stockSymbols, this.state.stocks, this.state.startDate, e.target.value);
      this.setState({
        endDate: e.target.value, 
        currentPeriod: '',
        chartData
      });
    }  
  }

  render() {
    const { 
      periods, 
      currentPeriod, 
      startDate, 
      endDate, 
      dateError, 
      chartData, 
      stocks 
    } = this.state;
    const { stockSymbols, colors } = this.props;

    return (
      <div className="chart-container">
        <h1 className="chart-container__title">Stocks</h1>
        <ChartControls 
          periods={periods} 
          current={currentPeriod} 
          handlePeriodChange={this.handlePeriodChange}
          startDate={startDate}
          endDate={endDate}
          handleDateChange={this.handleDateChange}
          dateError={dateError}
        />


        <div className="chart-container__chart" ref="chart">
          <Chart 
            stockSymbols={stockSymbols}
            chartData={chartData}
            stocks={stocks}
            colors={colors}
          />
        </div>

        <TableSR 
          stockSymbols={stockSymbols} 
          chartData={chartData}
        />
      </div>
    );
  }
}

ChartContainer.propTypes = {
  stockSymbols: PropTypes.arrayOf(PropTypes.string),
  colors: PropTypes.arrayOf(PropTypes.string)
};

export default ChartContainer;
