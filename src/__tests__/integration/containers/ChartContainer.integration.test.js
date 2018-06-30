import React from 'react';
import { mount } from 'enzyme';
import fetchMock from 'fetch-mock';
import ChartContainer from '../../../containers/ChartContainer';
import ChartControls from '../../../components/ChartControls';
import Chart from '../../../components/Chart';
import TableSR from '../../../components/TableSR';

describe('ChartContainer integration', () => {
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
    sessionStorageMock.setItem('period', '');
    sessionStorageMock.setItem('startDate', '');
    sessionStorageMock.setItem('endDate', '');

    fetchMock.get('*', stocks, { overwriteRoutes: true });

    wrapper = mount(<ChartContainer {...mockProps}/>);
  });

  afterAll(() => {
    fetchMock.restore();
  });

  describe('ChartControls', () => {
    it('has a ChartControls component', () => {
      expect(wrapper.find(ChartControls)).toHaveLength(1);
    });

    it('has 2 child divs', () => {
      expect(wrapper.find(ChartControls).find('.chart-controls').children()).toHaveLength(2);
    });

    describe('periods', () => {
      let periods, currentPeriod;
      beforeEach(() => {
        periods = ['1y', '1m'];
        currentPeriod = '1m';
      });

      it('has correct number of period buttons with correct key, name, and text', () => {
        wrapper.setState({ periods, currentPeriod });

        const buttons = wrapper.find(ChartControls).find('button');
        expect(buttons).toHaveLength(periods.length);

        expect(buttons.at(0).key()).toBe('1y');
        expect(buttons.at(0).prop('name')).toBe('1y');
        expect(buttons.at(0).text()).toBe('1y');

        expect(buttons.at(1).key()).toBe('1m');
        expect(buttons.at(1).prop('name')).toBe('1m');
        expect(buttons.at(1).text()).toBe('1m');
      });

      it('passes and sets "current" classname correctly', () => {
        wrapper.setState({ periods, currentPeriod });

        const buttons = wrapper.find(ChartControls).find('button');
        expect(buttons.at(0).hasClass('current')).toBe(false);
        expect(buttons.at(1).hasClass('current')).toBe(true);
      });

      it('calls handlePeriodChange with correct args when button clicked', () => {
        wrapper.instance().handlePeriodChange = jest.fn();
        wrapper.setState({ periods, currentPeriod });

        const button = wrapper.find(ChartControls).find('button').at(0);
        expect(button.text()).not.toBe(currentPeriod);

        button.simulate('click');

        expect(wrapper.instance().handlePeriodChange).toBeCalled();
        expect(wrapper.instance().handlePeriodChange.mock.calls[0][0].target.name).toBe('1y');
      });
      
      it('does not call handlePeriodChange when current button clicked', () => {
        wrapper.instance().handlePeriodChange = jest.fn();
        wrapper.setState({ periods, currentPeriod });

        const button = wrapper.find(ChartControls).find('button').at(1);
        expect(button.text()).toBe(currentPeriod);

        button.simulate('click');

        expect(wrapper.instance().handlePeriodChange).not.toBeCalled();
      });

      it('when button clicked, session storage and state set, and fetch called', () => {
        const oldStartDate = '2018-05-01';
        const oldEndDate = '2018-06-01';
        const newStartDate = '2018-04-01';
        const newEndDate = '2018-07-01';

        wrapper.instance().getDateRange = jest.fn().mockReturnValue([newStartDate, newEndDate]);
        wrapper.instance().callFetch = jest.fn();
        wrapper.setState({ 
          periods, 
          currentPeriod, 
          startDate: oldStartDate, 
          endDate: oldEndDate
        });
        
        const button = wrapper.find(ChartControls).find('button').at(0);
        button.simulate('click');

        expect(sessionStorage.getItem('period')).toBe(periods[0]);
        expect(sessionStorage.getItem('startDate')).toBeFalsy();
        expect(sessionStorage.getItem('endDate')).toBeFalsy();

        expect(wrapper.state('currentPeriod')).toBe(periods[0]);
        expect(wrapper.state('startDate')).toBe(newStartDate);
        expect(wrapper.state('endDate')).toBe(newEndDate);

        expect(wrapper.instance().callFetch).toBeCalledWith(mockProps.stockSymbols, periods[0]);
      });
    });

    describe('dates', () => {
      it('passes and displays dateError correctly', () => {
        const dateError = 'date error';
        wrapper.setState({ dateError });

        const div = wrapper.find(ChartControls).find('.chart-controls__date-error');
        expect(div.text()).toEqual(dateError);
      });

      it('passes and uses startDate and endDate correctly, with correct labels and inputs', () => {
        const startDate = '2018-01-01';
        const endDate = '2018-06-01';
        wrapper.setState({ startDate, endDate });

        const labels = wrapper.find('.chart-controls__date label');
        const inputs = wrapper.find('.chart-controls__date input');

        expect(labels).toHaveLength(2);
        expect(inputs).toHaveLength(2);

        expect(inputs.at(0).prop('id')).toBe('from');
        expect(inputs.at(1).prop('id')).toBe('to');

        expect(inputs.at(0).prop('value')).toBe(startDate);
        expect(inputs.at(1).prop('value')).toBe(endDate);
      });

      it('date inputs call handleDateChange on change', () => {
        wrapper.instance().handleDateChange = jest.fn();
        const startDate = '2018-01-01';
        const endDate = '2018-06-01';
        wrapper.setState({ startDate, endDate });

        const fromInput = wrapper.find('.chart-controls__date input').at(0);
        expect(wrapper.instance().handleDateChange).not.toBeCalled();
        fromInput.simulate('change');
        expect(wrapper.instance().handleDateChange).toBeCalled();
        expect(wrapper.instance().handleDateChange.mock.calls[0][0].target.id).toBe('from');
        expect(wrapper.instance().handleDateChange.mock.calls[0][0].target.value).toBe(startDate);
        
        const toInput = wrapper.find('.chart-controls__date input').at(1);
        expect(wrapper.instance().handleDateChange).toHaveBeenCalledTimes(1);
        toInput.simulate('change');
        expect(wrapper.instance().handleDateChange).toHaveBeenCalledTimes(2);
        expect(wrapper.instance().handleDateChange.mock.calls[1][0].target.id).toBe('to');
        expect(wrapper.instance().handleDateChange.mock.calls[1][0].target.value).toBe(endDate);
      });

      describe('handleDateChange', () => {
        let event, getDatePeriodReturnValue, getChartDataReturnValue;
        beforeEach(() => {
          event = { target: {
            id: 'from',
            value: '2018-03-01'
          } }

          getDatePeriodReturnValue = '6m';
          getChartDataReturnValue = [
            {"date": "2018-06-01", label: "Fri, 01 Jun 2018", FB: 101, AAPL: 201},
            {"date": "2018-06-04", label: "Mon, 04 Jun 2018", FB: 104, AAPL: 204},
            {"date": "2018-06-05", label: "Tue, 05 Jun 2018", FB: 105, AAPL: 205}
          ]
          wrapper.instance().validateDate = jest.fn().mockReturnValue({ success: true });
          wrapper.instance().getDatePeriod = jest.fn().mockReturnValue(getDatePeriodReturnValue);
          wrapper.instance().getChartData = jest.fn().mockReturnValue(getChartDataReturnValue);
        });

        it('does nothing but set dateError if validation fails', () => {
          const startDate = '2018-01-01';
          const endDate = '2018-06-01';
          const currentPeriod = '3m'
          wrapper.setState({ startDate, endDate, currentPeriod });

          const mockError = {
            success: false,
            error: 'some error'
          }
          wrapper.instance().validateDate = jest.fn().mockReturnValueOnce(mockError);

          wrapper.find('.chart-controls__date input').at(0).simulate('change', event);

          expect(wrapper.state('dateError')).toBe(mockError.error);

          expect(wrapper.state('startDate')).toEqual(startDate);
          expect(wrapper.state('endDate')).toEqual(endDate);
          expect(sessionStorage.getItem('startDate')).toBeFalsy();
          expect(sessionStorage.getItem('endDate')).toBeFalsy();
        });

        it('removes dateError if validation ok', () => {
          wrapper.setState({ dateError: 'some error' });
          wrapper.find('.chart-controls__date input').at(0).simulate('change', event);
          expect(wrapper.state('dateError')).toBe('');
        });

        it('when start date changed, sets sessionStorage and state correctly and calls fetch', () => {
          sessionStorage.setItem('period', '3m');

          const startDate = '2018-01-01';
          const endDate = '2018-06-01';
          const currentPeriod = '3m';
          wrapper.setState({ startDate, endDate, currentPeriod });

          wrapper.instance().callFetch = jest.fn();

          wrapper.find('.chart-controls__date input').at(0).simulate('change', event);

          expect(sessionStorage.getItem('startDate')).toBe(event.target.value);
          expect(sessionStorage.getItem('endDate')).toBe(endDate);
          expect(sessionStorage.getItem('period')).toBeFalsy();
          expect(wrapper.state('startDate')).toEqual(event.target.value);
          expect(wrapper.state('endDate')).toEqual(endDate);
          expect(wrapper.state('currentPeriod')).toEqual('');

          expect(wrapper.instance().getDatePeriod).toHaveBeenCalledTimes(1);
          expect(wrapper.instance().getDatePeriod).toBeCalledWith(event.target.value);

          expect(wrapper.instance().callFetch).toHaveBeenCalledTimes(1);
          expect(wrapper.instance().callFetch).toBeCalledWith(mockProps.stockSymbols, getDatePeriodReturnValue);
        });

        it('when end date changed, sets session storage and state correctly', () => {
          event.target.id = 'to';

          sessionStorage.setItem('period', '3m');

          const startDate = '2018-01-01';
          const endDate = '2018-06-01';
          const currentPeriod = '3m';
          wrapper.setState({ startDate, endDate, currentPeriod, stocks: {} });

          wrapper.instance().callFetch = jest.fn();

          wrapper.find('.chart-controls__date input').at(1).simulate('change', event);
          
          expect(sessionStorage.getItem('startDate')).toBe(startDate);
          expect(sessionStorage.getItem('endDate')).toBe(event.target.value);
          expect(sessionStorage.getItem('period')).toBeFalsy();
          expect(wrapper.state('startDate')).toEqual(startDate);
          expect(wrapper.state('endDate')).toEqual(event.target.value);
          expect(wrapper.state('currentPeriod')).toEqual('');

          expect(wrapper.instance().getChartData).toHaveBeenCalledTimes(1);
          expect(wrapper.instance().getChartData).toBeCalledWith(mockProps.stockSymbols, {}, startDate, event.target.value);

          expect(wrapper.instance().callFetch).not.toBeCalled();
        });

        it('when passed id other than "to" or "from", does nothing', () => {
          event.target.id = "";
          const prevState = wrapper.state();

          wrapper.instance().handleDateChange(event);

          expect(wrapper.state()).toEqual(prevState);
        });
      });
    });
  });

  describe('TableSR', () => {
    let chartData;
    beforeEach(() => {
      chartData = [
        {"date": "2018-06-01", label: "Fri, 01 Jun 2018", FB: 101, AAPL: 201},
        {"date": "2018-06-04", label: "Mon, 04 Jun 2018", FB: 104, AAPL: 204},
        {"date": "2018-06-05", label: "Tue, 05 Jun 2018", FB: 105, AAPL: 205}
      ]
      wrapper.setState({ chartData });
    });

    it('has a TableSR component', () => {
      expect(wrapper.find(TableSR)).toHaveLength(1);
    });

    it('has class of sr-only', () => {
      expect(wrapper.find(TableSR).childAt(0).hasClass('sr-only')).toBe(true);
    });
  
    it('contains a table', () => {
      const outer = wrapper.find(TableSR).childAt(0);
      expect(outer.children()).toHaveLength(1);
      expect(outer.childAt(0).type()).toBe('table');
    });
  
    it('stock symbols passed and used correctly in table headers', () => {
      const headerRow = wrapper.find(TableSR).find('thead').find('tr');
      expect(headerRow).toHaveLength(1);
      expect(headerRow.find('th')).toHaveLength(3);
      expect(headerRow.find('th').at(0).text()).toBe('Date');
      expect(headerRow.find('th').at(1).text()).toBe(mockProps.stockSymbols[0]);
      expect(headerRow.find('th').at(2).text()).toBe(mockProps.stockSymbols[1]);
    });

    it('stockSymbols and chartData passed and used correctly in table data', () => {
      const rows = wrapper.find(TableSR).find('tbody').find('tr');

      expect(rows).toHaveLength(chartData.length);
  
      const rowData1 = rows.at(0).find('td');
      expect(rowData1).toHaveLength(mockProps.stockSymbols.length + 1);
      expect(rowData1.at(0).text()).toBe(chartData[0].label);
      expect(rowData1.at(1).text()).toBe(chartData[0][mockProps.stockSymbols[0]].toString());
      expect(rowData1.at(2).text()).toBe(chartData[0][mockProps.stockSymbols[1]].toString());
  
      const rowData2 = rows.at(1).find('td');
      expect(rowData2).toHaveLength(3);
      expect(rowData2.at(0).text()).toBe(chartData[1].label);
      expect(rowData2.at(1).text()).toBe(chartData[1][mockProps.stockSymbols[0]].toString());
      expect(rowData2.at(2).text()).toBe(chartData[1][mockProps.stockSymbols[1]].toString());
  
      const rowData3 = rows.at(2).find('td');
      expect(rowData3).toHaveLength(3);
      expect(rowData3.at(0).text()).toBe(chartData[2].label);
      expect(rowData3.at(1).text()).toBe(chartData[2][mockProps.stockSymbols[0]].toString());
      expect(rowData3.at(2).text()).toBe(chartData[2][mockProps.stockSymbols[1]].toString());
    });

    it('td is null if stock symbol nonexistant in a chartData item', () => {
      const newChartData = [ ...chartData ]
      delete newChartData[0]['FB'];
      wrapper.setProps({ chartData: newChartData });

      const row1 = wrapper.find(TableSR).find('tbody').find('tr').at(0);
      expect(row1.find('td').at(1).text()).toBeFalsy();
      expect(row1.find('td').at(2).text()).toBe(newChartData[0]['AAPL'].toString());
    });
  });
});