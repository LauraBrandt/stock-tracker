import React from 'react';
import { shallow } from 'enzyme';
import AddStock from '../../../components/AddStock';

describe.skip('AddStock', () => {
  const mockProps = {
    error: '',
    value: 'abc',
    handleChange: jest.fn(),
    handleSubmit: jest.fn(),
    disabled: false,
    allStockSymbols: [
      {symbol: 'a', name: 'a inc.'}, 
      {symbol: 'b', name: 'b inc.'}
    ]
  }

  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<AddStock {...mockProps}/>);
  });

  afterEach(() => {
    mockProps.handleChange.mockReset();
    mockProps.handleSubmit.mockReset();
  });

  describe('form', () => {
    it('has a form with input and a button', () => {
      expect(wrapper.find('form')).toHaveLength(1);
      expect(wrapper.find('form input')).toHaveLength(1);
      expect(wrapper.find('form button')).toHaveLength(1);
    });

    it('uses handler from props for onSubmit', () => {
      expect(wrapper.find('form').prop('onSubmit')).toEqual(mockProps.handleSubmit);
      wrapper.find('form').simulate('submit');
      expect(mockProps.handleSubmit).toBeCalled();
    });
    
    it("doesn't use submit handler when disabled", () => {
      wrapper.setProps({ disabled: true });
      expect(wrapper.find('form').prop('onSubmit')).not.toEqual(mockProps.handleSubmit);
      wrapper.find('form').simulate('submit', { preventDefault() {} });
      expect(mockProps.handleSubmit).not.toBeCalled();
    });

    it('passes correct props to input', () => {
      const input = wrapper.find('form input');

      expect(input.prop('value')).toBe(mockProps.value);
      expect(input.prop('disabled')).toBe(mockProps.disabled);
      expect(input.prop('onChange')).toBe(mockProps.handleChange);

      input.simulate('change');
      expect(mockProps.handleChange).toBeCalled();
    });

    it('passes "disabled" prop to button class', () => {
      expect(wrapper.find('form button').prop('className')).not.toContain('disabled');
      wrapper.setProps({ disabled: true });
      expect(wrapper.find('form button').prop('className')).toContain('disabled');
    });
  });

  describe('error', () => {
    it("doesn't display error div when error empty", () => {
      expect(wrapper.find('.error')).toHaveLength(0);
    });
    
    it("displays error when error exists", () => {
      const error = 'error';
      wrapper.setProps({ error });
      expect(wrapper.find('.error')).toHaveLength(1);
      expect(wrapper.find('.error').text()).toBe(error);
    });
  });

  describe('datalist', () => {
    it('datalist id corresponds to input list attribute', () => {
      const datalistId = wrapper.find('datalist').prop('id');
      const inputList = wrapper.find('form input').prop('list');
      expect(datalistId).toBe(inputList);
    });

    it('contains option tags with the values in props.allStockSymbols', () => {
      const options = wrapper.find('datalist').find('option');
      expect(options).toHaveLength(mockProps.allStockSymbols.length);
      expect(options.at(0).prop('value')).toBe('a');
      expect(options.at(1).prop('value')).toBe('b');
    });
  });
});