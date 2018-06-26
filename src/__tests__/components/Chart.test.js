import React from 'react';
import { shallow } from 'enzyme';
import Chart from '../../components/Chart';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

describe('Chart', () => {
  const mockProps = {
    chartData: [
      {date: '2018-01-02', label: 'Tue, 02 Jan 2018', 'FB': 100, 'AAPL': 80},
      {date: '2018-01-03', label: 'Wed, 03 Jan 2018', 'FB': 101, 'AAPL': 79},
      {date: '2018-01-04', label: 'Thu, 04 Jan 2018', 'FB': 102, 'AAPL': 78}
    ],
    stockSymbols: ['FB', 'AAPL'],
    colors: ['hsl(0, 50%, 70%)', 'hsl(100, 50%, 70%)']
  }

  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<Chart {...mockProps}/>);
  });

  it('contains LineChart that uses chartDate', () => {
    expect(wrapper.find(LineChart)).toHaveLength(1);
    expect(wrapper.find(LineChart).prop('data')).toEqual(mockProps.chartData);
  });

  it('has same number of lines as stockSymbols', () => {
    expect(wrapper.find(Line)).toHaveLength(mockProps.stockSymbols.length);
  });

  it('passes correct props to each Line', () => {
    const line1 = wrapper.find(Line).at(0);
    const line2 = wrapper.find(Line).at(1);
    expect(line1.prop('dataKey')).toBe('FB');
    expect(line1.prop('stroke')).toBe('hsl(0, 50%, 70%)');
    expect(line2.prop('dataKey')).toBe('AAPL');
    expect(line2.prop('stroke')).toBe('hsl(100, 50%, 70%)');
  });

  it('has CartesianGrid, XAxis, YAxis, and Tooltip', () => {
    expect(wrapper.find(CartesianGrid)).toHaveLength(1);
    expect(wrapper.find(XAxis)).toHaveLength(1);
    const date = 'Mon, 01 Jan 2018';
    expect(wrapper.find(XAxis).prop('tickFormatter')(date)).toBe('01 Jan');
    expect(wrapper.find(YAxis)).toHaveLength(1);
    expect(wrapper.find(Tooltip)).toHaveLength(1);
  });

  describe('ResponsiveContainer width', () => {
    it('has a width of 99% for < 150 data points', () => {
      wrapper.setProps({ 
        chartData: new Array(149).fill({})
      });
      expect(wrapper.find(ResponsiveContainer).prop('width')).toBe('99%');
      wrapper.setProps({ 
        chartData: new Array(150).fill({})
      });
      expect(wrapper.find(ResponsiveContainer).prop('width')).not.toBe('99%');
    });

    it('has a width proportional to the number of data points when >= 150', () => {
      let dataLength = 150;
      wrapper.setProps({ 
        chartData: new Array(dataLength).fill({})
      });
      expect(wrapper.find(ResponsiveContainer).prop('width')).toBe(`${dataLength}%`);

      dataLength = 149;
      wrapper.setProps({ 
        chartData: new Array(dataLength).fill({})
      });
      expect(wrapper.find(ResponsiveContainer).prop('width')).not.toBe(`${dataLength}%`);
    });
  });

  describe('chartData is empty', () => {
    beforeEach(() => {
      wrapper.setProps({ chartData: [] });
    });

    it('has no lines', () => {
      expect(wrapper.find(Line)).toHaveLength(0);
    });

    it('still has other chart components', () => {
      expect(wrapper.find(LineChart)).toHaveLength(1);
      expect(wrapper.find(CartesianGrid)).toHaveLength(1);
      expect(wrapper.find(XAxis)).toHaveLength(1);
      expect(wrapper.find(YAxis)).toHaveLength(1);
      expect(wrapper.find(Tooltip)).toHaveLength(1);
    });
  });
});
