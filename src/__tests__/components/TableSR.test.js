import React from 'react';
import { shallow } from 'enzyme';
import TableSR from '../../components/TableSR';

describe('TableSR', () => {
  const mockProps = {
    chartData: [
      {date: '2018-01-02', label: 'Tue, 02 Jan 2018', 'FB': 100, 'AAPL': 80},
      {date: '2018-01-03', label: 'Wed, 03 Jan 2018', 'FB': 101, 'AAPL': 79},
      {date: '2018-01-04', label: 'Thu, 04 Jan 2018', 'FB': 102, 'AAPL': 78}
    ],
    stockSymbols: ['FB', 'AAPL']
  }

  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<TableSR {...mockProps}/>);
  });

  it('has class of sr-only', () => {
    expect(wrapper.hasClass('sr-only')).toBe(true);
  });

  it('contains a table', () => {
    expect(wrapper.children()).toHaveLength(1);
    expect(wrapper.childAt(0).type()).toBe('table');
  });

  it('has the correct table headers', () => {
    const headerRow = wrapper.find('thead').find('tr');
    expect(headerRow).toHaveLength(1);
    expect(headerRow.find('th')).toHaveLength(3);
    expect(headerRow.find('th').at(0).text()).toBe('Date');
    expect(headerRow.find('th').at(1).text()).toBe('FB');
    expect(headerRow.find('th').at(2).text()).toBe('AAPL');
  });

  it('has the correct number of rows', () => {
    expect(wrapper.find('tbody').find('tr')).toHaveLength(3);
  });

  it('each row has correct data', () => {
    const rows = wrapper.find('tbody').find('tr');

    const rowData1 = rows.at(0).find('td');
    expect(rowData1).toHaveLength(3);
    expect(rowData1.at(0).text()).toBe('Tue, 02 Jan 2018');
    expect(rowData1.at(1).text()).toBe('100');
    expect(rowData1.at(2).text()).toBe('80');

    const rowData2 = rows.at(1).find('td');
    expect(rowData2).toHaveLength(3);
    expect(rowData2.at(0).text()).toBe('Wed, 03 Jan 2018');
    expect(rowData2.at(1).text()).toBe('101');
    expect(rowData2.at(2).text()).toBe('79');

    const rowData3 = rows.at(2).find('td');
    expect(rowData3).toHaveLength(3);
    expect(rowData3.at(0).text()).toBe('Thu, 04 Jan 2018');
    expect(rowData3.at(1).text()).toBe('102');
    expect(rowData3.at(2).text()).toBe('78');
  });

  it('data row uses null value for nonexistant symbol', () => {
    const newChartData = [ ...mockProps.chartData ]
    newChartData[0] = {date: '2018-01-02', label: 'Tue, 02 Jan 2018', 'AAPL': 80},
    wrapper.setProps({ chartData: newChartData });

    const row1 = wrapper.find('tbody').find('tr').at(0);
    expect(row1.find('td').at(1).text()).toBeNull;
    expect(row1.find('td').at(2).text()).toBe('80');
  });

  describe('empty props', () => {
    const mockProps = {
      chartData: [],
      stockSymbols: []
    }

    it('renders', () => {
      const wrapper = shallow(<TableSR {...mockProps}/>);
      expect(wrapper.find('table')).toHaveLength(1);
      expect(wrapper.find('thead').find('tr').find('th')).toHaveLength(1);
      expect(wrapper.find('tbody')).toHaveLength(1);
      expect(wrapper.find('tbody').find('tr')).toHaveLength(0);
    });
  });
});
