import React from 'react';
import { mount } from 'enzyme';
import fetchMock from 'fetch-mock';
import StockList from '../../../containers/StockList';
import Stock from '../../../components/Stock';
import AddStock from '../../../components/AddStock';

describe('StockList integration', () => {
  jest.useFakeTimers();

  let wrapper, mockProps, fakePrices;
  beforeEach(() => {
    fakePrices = {"FB":{"price":195.55},"AAPL":{"price":185.025}}
    fetchMock.get('begin:https://api.iextrading.com/1.0/stock/market/batch?types=price', fakePrices, { overwriteRoutes: true });

    mockProps = {
      stockSymbols: ['FB', 'AAPL'],
      colors: ['hsl(0, 50%, 70%)', 'hsl(100, 50%, 70%)'],
      allStockSymbols: [
        {symbol: 'A', name: 'A inc.'}, 
        {symbol: 'FB', name: 'facebook'}
      ],
      socket: {
        emit: jest.fn()
      }
    }

    wrapper = mount(<StockList {...mockProps}/>);
  });

  afterAll(() => {
    fetchMock.restore();
  });

  describe('lifecycle', () => {
    it('sets busy to false whenever component receives props', () => {
      wrapper.setState({ busy: true });
      wrapper.setProps({ stockSymbols: [] });
      expect(wrapper.state('busy')).toBe(false);
      
      wrapper.setState({ busy: true });
      wrapper.setProps({ stockSymbols: ['FB'] });
      expect(wrapper.state('busy')).toBe(false);
      
      wrapper.setState({ busy: true });
      wrapper.setProps({ stockSymbols: mockProps.stockSymbols });
      expect(wrapper.state('busy')).toBe(false);
    });

    it("doesn't call fetch on receiving props if stockSymbols empty", () => {
      wrapper.instance().callFetchPrice = jest.fn();
      expect(wrapper.instance().callFetchPrice).not.toBeCalled();

      wrapper.setProps({ stockSymbols: [] });

      expect(wrapper.instance().callFetchPrice).not.toBeCalled();
      jest.runTimersToTime(35000);
      expect(wrapper.instance().callFetchPrice).not.toBeCalled();
    });

    it("doesn't call fetch on receiving props if new stockSymbols same as previous", () => {
      wrapper.instance().callFetchPrice = jest.fn();
      expect(wrapper.instance().callFetchPrice).not.toBeCalled();

      wrapper.setProps({ stockSymbols: mockProps.stockSymbols });

      expect(wrapper.instance().callFetchPrice).not.toBeCalled();
      jest.runTimersToTime(35000);
      expect(wrapper.instance().callFetchPrice).not.toBeCalled();
    });

    it('calls fetch with correct args on receiving props and each 30s after', () => {
      wrapper.instance().callFetchPrice = jest.fn();
      expect(wrapper.instance().callFetchPrice).not.toBeCalled();
      expect(wrapper.state('interval')).toBeNull();

      const newSymbols = ['FB'];
      wrapper.setProps({ stockSymbols: newSymbols });

      expect(wrapper.state('interval')).not.toBeNull();
      expect(wrapper.instance().callFetchPrice).toHaveBeenCalledTimes(1);
      expect(wrapper.instance().callFetchPrice).toBeCalledWith(newSymbols);
      jest.runTimersToTime(30000);
      expect(wrapper.instance().callFetchPrice).toHaveBeenCalledTimes(2);
      expect(wrapper.instance().callFetchPrice).toHaveBeenLastCalledWith(newSymbols);
      jest.runTimersToTime(30000);
      expect(wrapper.instance().callFetchPrice).toHaveBeenCalledTimes(3);
      expect(wrapper.instance().callFetchPrice).toHaveBeenLastCalledWith(newSymbols);
    });

    it('clears interval every time receives props', () => {
      wrapper.instance().callFetchPrice = jest.fn();
      expect(wrapper.instance().callFetchPrice).not.toBeCalled();

      wrapper.setProps({ stockSymbols: ['FB'] });
      expect(wrapper.instance().callFetchPrice).toHaveBeenCalledTimes(1);
      jest.runTimersToTime(30000);
      expect(wrapper.instance().callFetchPrice).toHaveBeenCalledTimes(2);

      wrapper.setProps({ stockSymbols: ['AAPL'] });
      expect(wrapper.instance().callFetchPrice).toHaveBeenCalledTimes(3);
      jest.runTimersToTime(30000);
      expect(wrapper.instance().callFetchPrice).toHaveBeenCalledTimes(4); // only called from new interval, not from the previous one too
    });

    it('clears interval on unmount', () => {
      wrapper.instance().callFetchPrice = jest.fn();
      const fetchSpy = wrapper.instance().callFetchPrice;
      expect(fetchSpy).not.toBeCalled();

      wrapper.setProps({ stockSymbols: ['FB'] });
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      jest.runTimersToTime(30000);
      expect(fetchSpy).toHaveBeenCalledTimes(2);

      clearInterval.mockClear();
      wrapper.unmount();

      expect(fetchSpy).toHaveBeenCalledTimes(2);
      jest.runTimersToTime(60000);
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('fetch', () => {
    const symbols = ['FB', 'AAPL'];

    it('calls fetch with price endpoint and correct symbols', () => {
      fetchMock.reset();
      expect(fetchMock.called()).toBe(false);

      wrapper.instance().callFetchPrice(symbols);

      expect(fetchMock.called('https://api.iextrading.com/1.0/stock/market/batch?types=price&symbols=FB,AAPL')).toBe(true);
    });

    it('sets state with prices fetch returns', () => {
      expect.assertions(1);

      return wrapper.instance().callFetchPrice(symbols).then(() => {
        expect(wrapper.state('prices')).toEqual(fakePrices);
      });
    });

    it('sets fetchError if error during fetch', () => {
      expect.assertions(2);

      const error = 'Some Error'
      fetchMock.get(
        'begin:https://api.iextrading.com/1.0/stock/market/batch?types=price', 
        () => { throw new Error(error) }, { overwriteRoutes: true }
      );

      return wrapper.instance().callFetchPrice(symbols).then(() => {
        expect(wrapper.state('prices')).toEqual({});
        expect(wrapper.state('fetchError')).toBe(error);
      });
    });
  });

  describe('Stock', () => {
    it('has as many Stock components as props.stockSymbols', () => {
      expect(wrapper.find('li')).toHaveLength(mockProps.stockSymbols.length);
      expect(wrapper.find(Stock)).toHaveLength(mockProps.stockSymbols.length);
    });

    it('color passed and used correctly in Stock', () => {
      const expected1 = { borderColor: mockProps.colors[0] };
      const actual1 = wrapper.find(Stock).at(0).find('.stock').prop('style');
      expect(actual1).toEqual(expected1);

      const expected2 = { borderColor: mockProps.colors[1] };
      const actual2 = wrapper.find(Stock).at(1).find('.stock').prop('style');
      expect(actual2).toEqual(expected2);
    });

    it('symbol passed and used correctly in Stock', () => {
      const expected1 = mockProps.stockSymbols[0];
      const actual1 = wrapper.find(Stock).at(0).find('.stock__symbol').text();
      expect(actual1).toBe(expected1);

      const expected2 = mockProps.stockSymbols[1];
      const actual2 = wrapper.find(Stock).at(1).find('.stock__symbol').text();
      expect(actual2).toBe(expected2);
    });

    it('name passed and used correctly in Stock', () => {
      // symbol exists in allStockSymbols
      const expected1 = 'facebook';
      const actual1 = wrapper.find(Stock).at(0).find('.stock__name').text();
      expect(actual1).toBe(expected1);

      // symbol doesn't exist in allStockSymbols
      const expected2 = '';
      const actual2 = wrapper.find(Stock).at(1).find('.stock__name').text();
      expect(actual2).toBe(expected2);
    });

    it('price passed and used correctly in Stock', () => {
      const prices = {
        AAPL: { price: 200 }
      };
      wrapper.setState({ prices });

      // price doesn't exist for that symbol
      const actual1 = wrapper.find(Stock).at(0).find('.stock__price').text();
      expect(actual1).toBeFalsy();

      // price exists for that symbol
      const expected2 = (200).toString();
      const actual2 = wrapper.find(Stock).at(1).find('.stock__price').text();
      expect(actual2).toBe(expected2);
    });

    it('has a button with correct name', () => {
      const button = wrapper.find(Stock).at(0).find('button.stock__remove');
      expect(button).toHaveLength(1);
      expect(button.prop('name')).toBe(mockProps.stockSymbols[0]);
    });

    it('disabled prop passed and used in button className correctly', () => {
      let button;

      wrapper.setState({ busy: true });
      button = wrapper.find(Stock).at(0).find('button.stock__remove');
      expect(button.prop('className')).toContain('disabled');
      
      wrapper.setState({ busy: false });
      button = wrapper.find(Stock).at(0).find('button.stock__remove');
      expect(button.prop('className')).not.toContain('disabled');
    });

    it('button calls removeStock with correct argument when not disabled', () => {
      wrapper.instance().removeStock = jest.fn();
      wrapper.setState({ busy: false });

      const button1 = wrapper.find(Stock).at(0).find('button.stock__remove');
      expect(wrapper.instance().removeStock).not.toBeCalled();
      button1.simulate('click');
      expect(wrapper.instance().removeStock).toBeCalled();
      expect(wrapper.instance().removeStock.mock.calls[0][0].target.name).toBe('FB');
      
      const button2 = wrapper.find(Stock).at(1).find('button.stock__remove');
      expect(wrapper.instance().removeStock).toHaveBeenCalledTimes(1);
      button2.simulate('click');
      expect(wrapper.instance().removeStock).toHaveBeenCalledTimes(2);
      expect(wrapper.instance().removeStock.mock.calls[1][0].target.name).toBe('AAPL');
    });
    
    it('button does not call removeStock when disabled', () => {
      wrapper.instance().removeStock = jest.fn();
      wrapper.setState({ busy: true });

      const button1 = wrapper.find(Stock).at(0).find('button.stock__remove');
      expect(wrapper.instance().removeStock).not.toBeCalled();
      button1.simulate('click');
      expect(wrapper.instance().removeStock).not.toBeCalled();
      
      const button2 = wrapper.find(Stock).at(1).find('button.stock__remove');
      button2.simulate('click');
      expect(wrapper.instance().removeStock).not.toBeCalled();
    });

    it('when button clicked, socket.emit called correctly and busy set to true', () => {
      expect(mockProps.socket.emit).not.toBeCalled();
      wrapper.setState({ busy: false });
      
      const button = wrapper.find(Stock).at(0).find('button.stock__remove');
      button.simulate('click');

      expect(mockProps.socket.emit).toBeCalledWith('remove', 'FB');
      expect(wrapper.state('busy')).toBe(true);
    });
  });

  describe('AddStock', () => {
    it('has an AddStock component if stockSymbols.length < 100', () => {
      expect(wrapper.find(AddStock)).toHaveLength(1);
    });
  
    it('has no AddStock component if stockSymbols.length >= 100', () => {
      wrapper.setProps({ stockSymbols: Array(100).fill().map((item, index) => index.toString()) });
      expect(wrapper.find(AddStock)).toHaveLength(0);
  
      wrapper.setProps({ stockSymbols: new Array(101).fill().map((item, index) => index.toString()) });
      expect(wrapper.find(AddStock)).toHaveLength(0);
    });

    it('has a form with input and a button', () => {
      expect(wrapper.find(AddStock).find('form')).toHaveLength(1);
      expect(wrapper.find(AddStock).find('form input')).toHaveLength(1);
      expect(wrapper.find(AddStock).find('form button')).toHaveLength(1);
    });

    it('passes and displays value correctly', () => {
      expect(wrapper.state('addValue')).toBe('');
      expect(wrapper.find(AddStock).find('input').prop('value')).toBe('');
      
      wrapper.setState({ addValue: 'abc' });
      expect(wrapper.find(AddStock).find('input').prop('value')).toBe('abc');
    });

    it('calls handleAddChange with correct arguments on input change', () => {
      wrapper.instance().handleAddChange = jest.fn();
      wrapper.setState({ busy: false, addValue: '' });

      const event = { target: { value: 'abc' } }

      const input = wrapper.find(AddStock).find('input');
      expect(wrapper.instance().handleAddChange).not.toBeCalled();

      input.simulate('change', event);

      expect(wrapper.instance().handleAddChange).toBeCalled();
      expect(wrapper.instance().handleAddChange.mock.calls[0][0].target.value).toBe('abc');
    });

    it('changes input value correctly', () => {
      wrapper.setState({ busy: false, addValue: '' });

      const event = { target: { value: 'abc' } }

      const input = wrapper.find(AddStock).find('input');
      input.simulate('change', event);

      expect(wrapper.state('addValue')).toBe('abc');
      expect(wrapper.find(AddStock).find('input').prop('value')).toBe('abc');
    });
    
    it('form submit does not call addNew when disabled', () => {
      wrapper.instance().addNew = jest.fn();
      wrapper.setState({ busy: true });

      const form = wrapper.find(AddStock).find('form');
      expect(wrapper.instance().addNew).not.toBeCalled();

      form.simulate('submit');

      expect(wrapper.instance().addNew).not.toBeCalled();
    });

    it('form submit calls addNew when not disabled', () => {
      wrapper.instance().addNew = jest.fn();
      wrapper.setState({ busy: false });

      const form = wrapper.find(AddStock).find('form');
      expect(wrapper.instance().addNew).not.toBeCalled();

      form.simulate('submit');

      expect(wrapper.instance().addNew).toBeCalled();
    });

    it('does nothing in addNew if stockSymbols.length is 100', () => {
      wrapper.setProps({ stockSymbols: Array(100).fill().map((item, index) => index.toString()) });
      wrapper.setState({ busy: false });

      const prevState = wrapper.state();

      wrapper.instance().addNew({ preventDefault: jest.fn() });

      expect(wrapper.state()).toEqual(prevState);
    });

    it('sets error and does not emit event on form submit if new stock already in list', () => {
      wrapper.setState({ busy: false, addValue: 'fb' });

      const form = wrapper.find(AddStock).find('form');
      form.simulate('submit');

      expect(wrapper.state('busy')).toBe(false);
      expect(wrapper.state('addValue')).toBe('fb');
      expect(wrapper.state('error')).toBe("'FB' is already displayed");
      expect(mockProps.socket.emit).not.toBeCalled();
    });

    it("sets error and does not emit event on form submit if new stock doesn't exist", () => {
      wrapper.setState({ busy: false, addValue: 'XYZ' });

      const form = wrapper.find(AddStock).find('form');
      form.simulate('submit');

      expect(wrapper.state('busy')).toBe(false);
      expect(wrapper.state('addValue')).toBe('XYZ');
      expect(wrapper.state('error')).toBe("Unknown or incorrect code");
      expect(mockProps.socket.emit).not.toBeCalled();
    });

    it('emits add event with correct argument on form submit if everything ok', () => {
      wrapper.setState({ busy: false, addValue: 'a' });

      const form = wrapper.find(AddStock).find('form');
      form.simulate('submit');

      expect(wrapper.state('busy')).toBe(true);
      expect(wrapper.state('addValue')).toBe('');
      expect(wrapper.state('error')).toBe('');
      expect(mockProps.socket.emit).toBeCalledWith('add', 'A');
    });

    it('passes and sets disabled correctly on input and button', () => {
      let input, button;

      wrapper.setState({ busy: true });
      button = wrapper.find(AddStock).find('form button');
      input = wrapper.find(AddStock).find('form input');
      expect(button.prop('className')).toContain('disabled');
      expect(input.prop('disabled')).toBe(true);
      
      wrapper.setState({ busy: false });
      button = wrapper.find(AddStock).find('form button');
      input = wrapper.find(AddStock).find('form input');
      expect(button.prop('className')).not.toContain('disabled');
      expect(input.prop('disabled')).toBe(false);
    });

    it('passes and displays error correctly when exists', () => {
      wrapper.setState({ error: 'some error' });
      expect(wrapper.find(AddStock).find('.error')).toHaveLength(1);
      expect(wrapper.find(AddStock).find('.error').text()).toBe('some error');
    });

    it('does not display error when empty', () => {
      wrapper.setState({ error: '' });
      expect(wrapper.find(AddStock).find('.error')).toHaveLength(0);
    });

    it('datalist id corresponds to input list attribute', () => {
      const datalistId = wrapper.find(AddStock).find('datalist').prop('id');
      const inputList = wrapper.find(AddStock).find('form input').prop('list');
      expect(datalistId).toBe(inputList);
    });

    it('passes and uses allStockSymbols correctly in datalist', () => {
      expect(wrapper.find(AddStock).find('datalist')).toHaveLength(1);

      const options = wrapper.find(AddStock).find('datalist').find('option');
      expect(options).toHaveLength(mockProps.allStockSymbols.length);

      expect(options.at(0).prop('value')).toBe('A');
      expect(options.at(1).prop('value')).toBe('FB');
    });
  });
});
