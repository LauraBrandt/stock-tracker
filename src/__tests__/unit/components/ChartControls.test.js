import React from 'react';
import { shallow } from 'enzyme';
import ChartControls from '../../../components/ChartControls';

describe.skip('ChartControls', () => {
  const mockProps = {
    periods: ['1m', '3m', '1y', '2y'],
    current: '3m',
    handlePeriodChange: jest.fn(),
    startDate: '2018-03-01',
    endDate: '2018-06-01',
    handleDateChange: jest.fn(),
    dateError: 'error'
  }

  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<ChartControls {...mockProps}/>);
  });

  afterEach(() => {
    mockProps.handlePeriodChange.mockReset();
    mockProps.handleDateChange.mockReset();
  });

  it('has two child divs', () => {
    expect(wrapper.children()).toHaveLength(2);
  });

  it('has correct number of period buttons with correct name and text', () => {
    const buttons = wrapper.find('.chart-controls__period button');
    expect(buttons).toHaveLength(mockProps.periods.length);
    expect(buttons.at(0).prop('name')).toBe('1m');
    expect(buttons.at(0).text()).toBe('1m');
    expect(buttons.at(1).prop('name')).toBe('3m');
    expect(buttons.at(1).text()).toBe('3m');
    expect(buttons.at(2).prop('name')).toBe('1y');
    expect(buttons.at(2).text()).toBe('1y');
    expect(buttons.at(3).prop('name')).toBe('2y');
    expect(buttons.at(3).text()).toBe('2y');
  });

  it('current period button only has class of "current"', () => {
    const buttons = wrapper.find('.chart-controls__period button');
    expect(buttons.at(0).prop('className')).not.toContain('current');
    expect(buttons.at(1).prop('className')).toContain('current');
    expect(buttons.at(2).prop('className')).not.toContain('current');
    expect(buttons.at(3).prop('className')).not.toContain('current');
  });

  it('period buttons have handlePeriodChange() attached to onClick, except current', () => {
    const buttons = wrapper.find('.chart-controls__period button');
    
    expect(buttons.at(0).prop('onClick')).toEqual(mockProps.handlePeriodChange);
    expect(buttons.at(1).prop('onClick')).not.toEqual(mockProps.handlePeriodChange);
    expect(buttons.at(2).prop('onClick')).toEqual(mockProps.handlePeriodChange);
    expect(buttons.at(3).prop('onClick')).toEqual(mockProps.handlePeriodChange);

    buttons.at(0).simulate('click');
    expect(mockProps.handlePeriodChange).toHaveBeenCalledTimes(1);

    buttons.at(1).simulate('click');
    expect(mockProps.handlePeriodChange).toHaveBeenCalledTimes(1);

    buttons.at(2).simulate('click');
    expect(mockProps.handlePeriodChange).toHaveBeenCalledTimes(2);

    buttons.at(3).simulate('click');
    expect(mockProps.handlePeriodChange).toHaveBeenCalledTimes(3);
  });

  it('displays date error', () => {
    expect(wrapper.find('.chart-controls__date-error')).toHaveLength(1);
    expect(wrapper.find('.chart-controls__date-error').text()).toBe(mockProps.dateError);
  });

  it('has "from" and "to" labels and inputs', () => {
    expect(wrapper.find('.chart-controls__date label')).toHaveLength(2);
    expect(wrapper.find('.chart-controls__date input')).toHaveLength(2);
    expect(wrapper.find('.chart-controls__date input').at(0).prop('id')).toBe('from');
    expect(wrapper.find('.chart-controls__date input').at(1).prop('id')).toBe('to');
  });

  it('date inputs are passed the correct values', () => {
    const inputs = wrapper.find('.chart-controls__date input');
    expect(inputs.at(0).prop('value')).toBe(mockProps.startDate);
    expect(inputs.at(1).prop('value')).toBe(mockProps.endDate);
  });

  it('date inputs use handleDateChange from props', () => {
    const inputs = wrapper.find('.chart-controls__date input');

    expect(inputs.at(0).prop('onChange')).toEqual(mockProps.handleDateChange);
    expect(inputs.at(1).prop('onChange')).toEqual(mockProps.handleDateChange);
    
    inputs.at(0).simulate('change');
    expect(mockProps.handleDateChange).toHaveBeenCalledTimes(1);
    
    inputs.at(1).simulate('change');
    expect(mockProps.handleDateChange).toHaveBeenCalledTimes(2);
  });
});