import React from 'react';
import { shallow, mount } from 'enzyme';
import fetchMock from 'fetch-mock';
import ChartContainer from '../../../containers/ChartContainer';
import ChartControls from '../../../components/ChartControls';
import Chart from '../../../components/Chart';
import TableSR from '../../../components/TableSR';
import chartDataHelper from '../../../lib/chartDataHelper';

jest.mock('../../../lib/chartDataHelper', () => ({
  getDateRange: jest.fn().mockReturnValue(['2016-08-24', '2016-11-24']), 
  validateDate: jest.fn().mockReturnValue({ success: true }), 
  getDatePeriod: jest.fn().mockReturnValue('3m'), 
  getChartData: jest.fn().mockReturnValue([
    {"date": "2018-06-01", label: "Fri, 01 Jun 2018", FB: 101, AAPL: 201},
    {"date": "2018-06-04", label: "Mon, 04 Jun 2018", FB: 104, AAPL: 204},
    {"date": "2018-06-05", label: "Tue, 05 Jun 2018", FB: 105, AAPL: 205}
  ])
}));

describe.skip('ChartContainer unit', () => {
  const cdhMockReturnValues = {
    getDateRange: ['2016-08-24', '2016-11-24'],
    validateDate: { success: true },
    getDatePeriod: '3m',
    getChartData: [
      {"date": "2018-06-01", label: "Fri, 01 Jun 2018", FB: 101, AAPL: 201},
      {"date": "2018-06-04", label: "Mon, 04 Jun 2018", FB: 104, AAPL: 204},
      {"date": "2018-06-05", label: "Tue, 05 Jun 2018", FB: 105, AAPL: 205}
    ]
  }
  
  const stocks = {
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

  const mockProps = {
    stockSymbols: ['FB', 'AAPL'],
    colors: ['hsl(0, 50%, 70%)', 'hsl(100, 50%, 70%)'],
  }

  const sessionStorageMock = (function() {
    let store = {}
    return {
      getItem: function(key) {
        return store[key] || null;
      },
      setItem: function(key, value) {
        store[key] = value.toString();
      },
    }
  })();

  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
  });

  let wrapper;

  beforeEach(() => {
    fetchMock.get('*', stocks, { overwriteRoutes: true });
    wrapper = shallow(<ChartContainer {...mockProps}/>);
  });

  afterAll(() => {
    fetchMock.restore();
  });

  describe('children', () => {
    it('has a ChartControls component', () => {
      expect(wrapper.find(ChartControls)).toHaveLength(1);
    });

    it('passes correct props to ChartControls', () => {      
      const state = { 
        periods: ['1m', '3m', '1y', '2y'],
        current: '3m',
        startDate: '2018-03-01',
        endDate: '2018-06-01',
        dateError: 'date error'
      }
      wrapper.setState(state);

      expect(wrapper.find(ChartControls).prop('periods'))
        .toEqual(state.periods);
      expect(wrapper.find(ChartControls).prop('current'))
        .toEqual(state.current);
      expect(wrapper.find(ChartControls).prop('handlePeriodChange'))
        .toEqual(wrapper.instance().handlePeriodChange);
      expect(wrapper.find(ChartControls).prop('startDate'))
        .toEqual(state.startDate);
      expect(wrapper.find(ChartControls).prop('endDate'))
        .toEqual(state.endDate);
      expect(wrapper.find(ChartControls).prop('handleDateChange'))
        .toEqual(wrapper.instance().handleDateChange);
      expect(wrapper.find(ChartControls).prop('dateError'))
        .toEqual(state.dateError);
    });

    it('has a Chart component', () => {
      expect(wrapper.find(Chart)).toHaveLength(1);
    });

    it('passes correct props to Chart', () => {
      const state = { 
        stockSymbols: ['FB', 'AAPL'],
        chartData: [
          {"date": "2018-06-04", label: "Mon, 04 Jun 2018", FB: 104, AAPL: 204},
          {"date": "2018-06-05", label: "Tue, 05 Jun 2018", FB: 105, AAPL: 205}
        ],
        colors: ['hsl(0, 50%, 70%)', 'hsl(100, 50%, 70%)']
      }
      wrapper.setState(state);

      expect(wrapper.find(Chart).prop('stockSymbols'))
        .toEqual(state.stockSymbols);
      expect(wrapper.find(Chart).prop('chartData'))
        .toEqual(state.chartData);
      expect(wrapper.find(Chart).prop('colors'))
        .toEqual(state.colors);
    });

    it('has a TableSR component', () => {
      expect(wrapper.find(TableSR)).toHaveLength(1);
    });

    it('passes correct props to TableSR', () => {
      const state = { 
        stockSymbols: ['FB', 'AAPL'],
        chartData: [
          {"date": "2018-06-04", label: "Mon, 04 Jun 2018", FB: 104, AAPL: 204},
          {"date": "2018-06-05", label: "Tue, 05 Jun 2018", FB: 105, AAPL: 205}
        ]
      }
      wrapper.setState(state);

      expect(wrapper.find(TableSR).prop('stockSymbols'))
        .toEqual(state.stockSymbols);
      expect(wrapper.find(TableSR).prop('chartData'))
        .toEqual(state.chartData);
    });
  });

  describe('methods', () => {
    describe('componentDidMount', () => {
      it('sets currentPeriod, startDate, and endDate based on period in sessionStorage, if exists', () => {
        sessionStorage.setItem('period', '1y');
        sessionStorage.setItem('startDate', '');
        sessionStorage.setItem('endDate', '');

        wrapper = shallow(<ChartContainer {...mockProps}/>);

        expect(wrapper.state('currentPeriod')).toBe('1y');
        expect(wrapper.state('startDate')).toBe(cdhMockReturnValues.getDateRange[0]);
        expect(wrapper.state('endDate')).toBe(cdhMockReturnValues.getDateRange[1]);
      });

      it('sets currentPeriod, startDate, and endDate based on dates in sessionStorage if no period', () => {
        sessionStorage.setItem('period', '');
        sessionStorage.setItem('startDate', '2018-01-01');
        sessionStorage.setItem('endDate', '2018-06-01');

        wrapper = shallow(<ChartContainer {...mockProps}/>);

        expect(wrapper.state('currentPeriod')).toBe('');
        expect(wrapper.state('startDate')).toBe('2018-01-01');
        expect(wrapper.state('endDate')).toBe('2018-06-01');
      });

      it('uses default period if sessionStorage empty', () => {
        sessionStorage.setItem('period', '');
        sessionStorage.setItem('startDate', '');
        sessionStorage.setItem('endDate', '');

        wrapper = shallow(<ChartContainer {...mockProps}/>);

        expect(wrapper.state('currentPeriod')).toBe('3m');
        expect(wrapper.state('startDate')).toBe(cdhMockReturnValues.getDateRange[0]);
        expect(wrapper.state('endDate')).toBe(cdhMockReturnValues.getDateRange[1]);
      });
    });

    describe('componentWillReceiveProps', () => {
      it('does nothing if stockSymbols empty', () => {
        wrapper.instance().callFetch = jest.fn();
        expect(wrapper.instance().callFetch).not.toBeCalled();

        wrapper.setProps({ stockSymbols: [] });

        expect(wrapper.instance().callFetch).not.toBeCalled();
      });

      it('does nothing if new stockSymbols same as old', () => {
        wrapper.instance().callFetch = jest.fn();
        expect(wrapper.instance().callFetch).not.toBeCalled();

        wrapper.setProps({ stockSymbols: mockProps.stockSymbols });

        expect(wrapper.instance().callFetch).not.toBeCalled();
      });

      it('calls fetch with period from sessionStorage if exists', () => {
        sessionStorage.setItem('period', '2y');
        sessionStorage.setItem('startDate', '');
        sessionStorage.setItem('endDate', '');

        wrapper.instance().callFetch = jest.fn();
        expect(wrapper.instance().callFetch).not.toBeCalled();

        const newSymbols = ['FB']
        wrapper.setProps({ stockSymbols: newSymbols });
        
        expect(wrapper.instance().callFetch).toBeCalledWith(newSymbols, '2y');
      });

      it('calls fetch with period based on dates if dates but not period in sessionStorage', () => {
        sessionStorage.setItem('period', '');
        sessionStorage.setItem('startDate', '2018-01-01');
        sessionStorage.setItem('endDate', '2018-06-01');

        wrapper.instance().callFetch = jest.fn();
        expect(wrapper.instance().callFetch).not.toBeCalled();

        const newSymbols = ['FB']
        wrapper.setProps({ stockSymbols: newSymbols });
        
        expect(wrapper.instance().callFetch).toBeCalledWith(newSymbols, cdhMockReturnValues.getDatePeriod);
      });

      it('calls fetch with default period if sessionStorage empty', () => {
        sessionStorage.setItem('period', '');
        sessionStorage.setItem('startDate', '');
        sessionStorage.setItem('endDate', '');
        wrapper.setState({ currentPeriod: '3m' });

        wrapper.instance().callFetch = jest.fn();
        expect(wrapper.instance().callFetch).not.toBeCalled();

        const newSymbols = ['FB']
        wrapper.setProps({ stockSymbols: newSymbols });

        expect(wrapper.instance().callFetch).toBeCalledWith(newSymbols, '3m');
      });
    });

    describe('callFetch', () => {
      Object.defineProperty(window.HTMLElement.prototype, 'scrollWidth', {
        writable: true,
        value: {},
      });

      const symbols = ['FB', 'AAPL'];
      const period = '3m';

      it('calls fetch with chart endpoint and correct period and stockSymbols', () => {
        fetchMock.reset();

        wrapper.instance().callFetch(symbols, period);
        expect(fetchMock.called('https://api.iextrading.com/1.0/stock/market/batch?types=chart&range=3m&symbols=FB,AAPL')).toBe(true);
      });

      it('sets state with fetch return value', done => {
        expect.assertions(3);
        fetchMock.reset();
        chartDataHelper.getChartData.mockClear();

        wrapper.instance().callFetch(symbols, period).then(() => {
          expect(chartDataHelper.getChartData).toHaveBeenCalledWith(
            symbols,
            stocks,
            cdhMockReturnValues.getDateRange[0],
            cdhMockReturnValues.getDateRange[1]
          );
          expect(wrapper.state('stocks')).toEqual(stocks);
          expect(wrapper.state('chartData')).toEqual(cdhMockReturnValues.getChartData);
          done();
        }).catch(res => {console.log(res); done();});
      });

      it('sets scroll to right on year periods', done => {
        expect.assertions(2);

        wrapper = mount(<ChartContainer {...mockProps} />);
        wrapper.instance().refs.chart.scrollWidth = 300
        fetchMock.reset();

        const period = '1y';

        wrapper.instance().callFetch(symbols, period).then(() => {
          const ref = wrapper.instance().refs.chart;
          expect(ref.scrollWidth).toBe(300);
          expect(ref.scrollLeft).toBe(ref.scrollWidth);
          
          done();
        }).catch((res) => {console.log(res); done();});
      });

      it("doesn't set scroll on non-year periods", done => {
        expect.assertions(3);

        wrapper = mount(<ChartContainer {...mockProps} />);
        wrapper.instance().refs.chart.scrollWidth = 300
        fetchMock.reset();

        wrapper.instance().callFetch(symbols, period).then(() => {
          const ref = wrapper.instance().refs.chart;
          expect(ref.scrollWidth).toBe(300);
          expect(ref.scrollLeft).not.toBe(ref.scrollWidth);
          expect(ref.scrollLeft).toBe(0);
          
          done();
        }).catch((res) => {console.log(res); done();});
      });

      it('sets fetchError in state when error fetching', done => {
        expect.assertions(1);

        fetchMock.get('*', () => {
          throw new Error('Some Error')
        }, { overwriteRoutes: true });
        
        wrapper = shallow(<ChartContainer />);
        fetchMock.reset();

        wrapper.instance().callFetch(symbols, period).then(() => {
          expect(wrapper.state('fetchError')).toEqual('Some Error');
          done();
        });
      });
    });

    describe('handlePeriodChange', () => {
      const event = {
        target: {
          name: '6m'
        }
      }

      it('sets sessionStorage', () => {
        sessionStorage.setItem('period', '1y');
        sessionStorage.setItem('startDate', '2018-01-01');
        sessionStorage.setItem('endDate', '2018-02-01');

        expect(sessionStorage.getItem('period')).toBe('1y');
        expect(sessionStorage.getItem('startDate')).toBe('2018-01-01');
        expect(sessionStorage.getItem('endDate')).toBe('2018-02-01');

        wrapper.instance().handlePeriodChange(event);

        expect(sessionStorage.getItem('period')).toBe(event.target.name);
        expect(sessionStorage.getItem('startDate')).toBeFalsy();
        expect(sessionStorage.getItem('endDate')).toBeFalsy();
      });

      it('sets state', () => {
        wrapper.setState({
          currentPeriod: '3m',
          startDate: '',
          endDate: ''
        });
        const [expectedStartDate, expectedEndDate] = cdhMockReturnValues.getDateRange;

        wrapper.instance().handlePeriodChange(event);

        expect(wrapper.state('currentPeriod')).toBe(event.target.name);
        expect(wrapper.state('startDate')).toBe(expectedStartDate);
        expect(wrapper.state('endDate')).toBe(expectedEndDate);
      });

      it('calls fetch with correct arguments', () => {
        wrapper.instance().callFetch = jest.fn();
        expect(wrapper.instance().callFetch).not.toBeCalled();
        
        wrapper.instance().handlePeriodChange(event);
        
        expect(wrapper.instance().callFetch).toBeCalledWith(mockProps.stockSymbols, event.target.name);
      });
    });

    describe('handleDateChange', () => {
      let event;
      beforeEach(() => {
        event = {
          target: {
            id: 'from',
            value: '2017-01-01'
          }
        }
      });

      it('if validation error, sets dateError and returns', () => {
        chartDataHelper.validateDate.mockReturnValueOnce({ success: false, error: 'some error' });
        wrapper.setState({ dateError: '' });
        const prevState = wrapper.state();

        wrapper.instance().handleDateChange(event);

        const finalState = wrapper.state();
        expect(finalState.dateError).toBe('some error');
        expect(finalState.startDate).toBe(prevState.startDate);
        expect(finalState.endDate).toBe(prevState.endDate);
        expect(finalState.period).toBe(prevState.period);
      });

      it('if no validation error, sets dateError to empty string', () => {
        wrapper.setState({ dateError: 'error' });

        wrapper.instance().handleDateChange(event);

        expect(wrapper.state('dateError')).toBe('');
      });

      it('on "from" sets sessionStorage', () => {
        wrapper.setState({ endDate: '2018-06-01' });
        sessionStorage.setItem('period', '1y');
        sessionStorage.setItem('startDate', '');
        sessionStorage.setItem('endDate', '');

        wrapper.instance().handleDateChange(event);

        expect(sessionStorage.getItem('startDate')).toBe(event.target.value);
        expect(sessionStorage.getItem('endDate')).toBe('2018-06-01');
        expect(sessionStorage.getItem('period')).toBeFalsy();
      });

      it('on "from" sets state', () => {
        wrapper.setState({ startDate: '2018-01-01', currentPeriod: '6m' });

        wrapper.instance().handleDateChange(event);

        expect(wrapper.state('startDate')).toBe(event.target.value);
        expect(wrapper.state('currentPeriod')).toBe('');
      });

      it('on "from" calls getDatePeriod with correct arguments', () => {
        wrapper.instance().handleDateChange(event);
        expect(chartDataHelper.getDatePeriod).toHaveBeenCalledWith(event.target.value);
      });

      it('on "from" calls fetch with correct arguments', () => {
        wrapper.instance().callFetch = jest.fn();
        expect(wrapper.instance().callFetch).not.toBeCalled();
        
        wrapper.instance().handleDateChange(event);
        
        expect(wrapper.instance().callFetch).toBeCalled();
        expect(wrapper.instance().callFetch).toBeCalledWith(mockProps.stockSymbols, cdhMockReturnValues.getDatePeriod);
      });

      it('on "to" sets sessionStorage', () => {
        event.target.id = "to";

        wrapper.setState({ startDate: '2018-06-01' });
        sessionStorage.setItem('period', '1y');
        sessionStorage.setItem('startDate', '');
        sessionStorage.setItem('endDate', '');

        wrapper.instance().handleDateChange(event);

        expect(sessionStorage.getItem('startDate')).toBe('2018-06-01');
        expect(sessionStorage.getItem('endDate')).toBe(event.target.value);
        expect(sessionStorage.getItem('period')).toBeFalsy();
      });

      it('on "to" calls getChartData with correct arguments', () => {
        event.target.id = "to";

        wrapper.setState({ startDate: '2018-01-01', stocks: {} });

        wrapper.instance().handleDateChange(event);

        expect(chartDataHelper.getChartData).toHaveBeenCalledWith(
          mockProps.stockSymbols,
          {},
          '2018-01-01',
          event.target.value
        );
      });

      it('on "to" sets state', () => {
        event.target.id = "to";

        wrapper.setState({ endDate: '2018-01-01', currentPeriod: '6m', chartData: [] });

        wrapper.instance().handleDateChange(event);

        expect(wrapper.state('endDate')).toBe(event.target.value);
        expect(wrapper.state('currentPeriod')).toBe('');
        expect(wrapper.state('chartData')).toEqual(cdhMockReturnValues.getChartData);
      });

      it('does nothing if id is not "to" or "from"', () => {
        event.target.id = "";
        const prevState = wrapper.state();

        wrapper.instance().handleDateChange(event);

        expect(wrapper.state()).toEqual(prevState);
      });
    });
  });
});