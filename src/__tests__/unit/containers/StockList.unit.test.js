import React from 'react';
import { shallow } from 'enzyme';
import fetchMock from 'fetch-mock';
import StockList from '../../../containers/StockList';
import Stock from '../../../components/Stock';
import AddStock from '../../../components/AddStock';

describe.skip('StockList unit', () => {
  jest.useFakeTimers();

  let wrapper, mockProps, fakePrices;
  beforeEach(() => {
    fakePrices = {"FB":{"price":195.55},"AAPL":{"price":185.025}}
    fetchMock.get('begin:https://api.iextrading.com/1.0/stock/market/batch?types=price', fakePrices, { overwriteRoutes: true });

    mockProps = {
      stockSymbols: ['FB', 'AAPL'],
      colors: ['hsl(0, 50%, 70%)', 'hsl(100, 50%, 70%)'],
      allStockSymbols: [
        {symbol: 'a', name: 'a inc.'}, 
        {symbol: 'FB', name: 'facebook'}
      ],
      socket: {
        emit: jest.fn()
      }
    }

    wrapper = shallow(<StockList {...mockProps}/>);
  });

  describe('children', () => {
    it('has as many Stock components as props.stockSymbols', () => {
      expect(wrapper.find('li')).toHaveLength(mockProps.stockSymbols.length);
      expect(wrapper.find(Stock)).toHaveLength(mockProps.stockSymbols.length);
    });

    it('passes correct props to Stock', () => {
      wrapper.instance().findSymbol = jest.fn().mockReturnValue({name: 'company name'});

      const state = { 
        busy: false ,
        prices: {
          FB: { price: 100 },
          AAPL: { price: 200 }
        }
      };
      wrapper.setState(state);

      const stock1 = wrapper.find(Stock).at(0);
      expect(stock1.prop('symbol')).toBe(mockProps.stockSymbols[0]);
      expect(stock1.prop('name')).toBe('company name');
      expect(stock1.prop('price')).toBe(state.prices.FB.price);
      expect(stock1.prop('color')).toBe(mockProps.colors[0]);
      expect(stock1.prop('handleRemove')).toBe(wrapper.instance().removeStock);
      expect(stock1.prop('disabled')).toBe(state.busy);
      
      const stock2 = wrapper.find(Stock).at(1);
      expect(stock2.prop('symbol')).toBe(mockProps.stockSymbols[1]);
      expect(stock2.prop('name')).toBe('company name');
      expect(stock2.prop('price')).toBe(state.prices.AAPL.price);
      expect(stock2.prop('color')).toBe(mockProps.colors[1]);
      expect(stock2.prop('handleRemove')).toBe(wrapper.instance().removeStock);
      expect(stock2.prop('disabled')).toBe(state.busy);
    });

    it('passes empty string to Stock props.name if symbol not in stocks', () => {
      wrapper.instance().findSymbol = jest.fn().mockReturnValue(null);
      expect(wrapper.find(Stock).at(1).prop('name')).toBe('');
    });

    it('passes null to Stock props.price if symbol not in prices', () => {
      const state = { 
        prices: {
          AAPL: { price: 200 }
        }
      };
      wrapper.setState(state);

      expect(wrapper.find(Stock).at(0).prop('price')).toBeNull;
    });

    it('has an AddStock component if stockSymbols.length < 100', () => {
      expect(wrapper.find(AddStock)).toHaveLength(1);
    });

    it('passes correct props to AddStock', () => {
      const state = { 
        error: 'some error',
        addValue: 'abc',
        busy: true
      }
      wrapper.setState(state);

      expect(wrapper.find(AddStock).prop('error')).toEqual(state.error);
      expect(wrapper.find(AddStock).prop('value')).toEqual(state.addValue);
      expect(wrapper.find(AddStock).prop('handleChange'))
        .toEqual(wrapper.instance().handleAddChange);
      expect(wrapper.find(AddStock).prop('handleSubmit'))
        .toEqual(wrapper.instance().addNew);
      expect(wrapper.find(AddStock).prop('disabled')).toEqual(state.busy);
      expect(wrapper.find(AddStock).prop('allStockSymbols')).toEqual(mockProps.allStockSymbols);
    });
    
    it('has no AddStock component if stockSymbols.length >= 100', () => {
      wrapper.setProps({ stockSymbols: new Array(100).fill('') });
      expect(wrapper.find(AddStock)).toHaveLength(0);

      wrapper.setProps({ stockSymbols: new Array(101).fill('') });
      expect(wrapper.find(AddStock)).toHaveLength(0);
    });
  });

  describe('methods', () => {
    describe('componentWillReceiveProps', () => {
      it('does nothing if stockSymbols empty', () => {
        wrapper.instance().callFetchPrice = jest.fn();
        expect(wrapper.instance().callFetchPrice).not.toBeCalled();

        wrapper.setProps({ stockSymbols: [] });

        expect(wrapper.instance().callFetchPrice).not.toBeCalled();
      });

      it('does nothing if new stockSymbols same as old', () => {
        wrapper.instance().callFetchPrice = jest.fn();
        expect(wrapper.instance().callFetchPrice).not.toBeCalled();

        wrapper.setProps({ stockSymbols: mockProps.stockSymbols });

        expect(wrapper.instance().callFetchPrice).not.toBeCalled();
      });

      it('calls callFetchPrice with new stockSymbols', () => {
        wrapper.instance().callFetchPrice = jest.fn();
        expect(wrapper.instance().callFetchPrice).not.toBeCalled();

        const newSymbols = ['FB']
        wrapper.setProps({ stockSymbols: newSymbols });

        expect(wrapper.instance().callFetchPrice).toBeCalledWith(newSymbols);
      });

      it('clears and sets interval correctly', () => {
        wrapper.instance().callFetchPrice = jest.fn();
        wrapper.setState({ interval: 'myinterval' })
        clearInterval.mockClear();
        
        const newSymbols = ['FB']
        wrapper.setProps({ stockSymbols: newSymbols });

        expect(clearInterval).toHaveBeenCalledTimes(1);
        expect(clearInterval).toBeCalledWith('myinterval');

        expect(wrapper.instance().callFetchPrice).toHaveBeenCalledTimes(1);
        jest.runTimersToTime(35000);
        expect(wrapper.instance().callFetchPrice).toHaveBeenCalledTimes(2);
        jest.runTimersToTime(35000);
        expect(wrapper.instance().callFetchPrice).toHaveBeenCalledTimes(3);
      });
    });

    describe('componentWillUnmount', () => {
      it('calls clearInterval', () => {
        wrapper.setState({ interval: 'myinterval' })
        clearInterval.mockClear();
        wrapper.unmount();
        expect(clearInterval).toHaveBeenCalledTimes(1);
        expect(clearInterval).toBeCalledWith('myinterval');
      });
    });

    describe('callFetchPrice', () => {
      const symbols = ['FB', 'AAPL'];

      it('calls fetch with price endpoint and correct symbols', () => {
        fetchMock.reset();

        wrapper.instance().callFetchPrice(symbols);
        expect(fetchMock.called('https://api.iextrading.com/1.0/stock/market/batch?types=price&symbols=FB,AAPL')).toBe(true);
      });

      it('sets state with fetch return value', done => {
        expect.assertions(1);
        fetchMock.reset();

        wrapper.instance().callFetchPrice(symbols).then(() => {
          expect(wrapper.state('prices')).toEqual(fakePrices);
          done();
        }).catch(res => {console.log(res); done();});
      });

      it('sets fetchError in state when error fetching', done => {
        expect.assertions(2);

        wrapper.setState({
          fetchError: '',
          busy: true
        });
        fetchMock.get('begin:https://api.iextrading.com/1.0/stock/market/batch?types=price', () => {
          throw new Error('Some Error')
        }, { overwriteRoutes: true });
        fetchMock.reset();

        wrapper.instance().callFetchPrice(symbols).then(() => {
          expect(wrapper.state('fetchError')).toEqual('Some Error');
          expect(wrapper.state('busy')).toEqual(false);
          done();
        }).catch(res => {console.log(res); done();});
      });
    });

    describe('handleAddChange', () => {
      const event = {
        target: {
          value: 'abc'
        }
      }

      it('sets addValue state', () => {
        wrapper.setState({ addValue: '' });
        wrapper.instance().handleAddChange(event);
        expect(wrapper.state('addValue')).toBe(event.target.value);
      });
    });
    
    describe('addNew', () => {
      const event = {
        preventDefault: jest.fn()
      }

      it('does nothing if stockSymbols has 100 values', () => {
        wrapper.setProps({ stockSymbols: new Array(100).fill('')});
        const prevState = wrapper.state();

        wrapper.instance().addNew(event);

        expect(wrapper.state()).toEqual(prevState);
      });

      it('if new symbol already in list, set error', () => {
        wrapper.setState({ busy: false, error: '', addValue: 'fb' });

        wrapper.instance().addNew(event);

        expect(wrapper.state('busy')).toBe(false);
        expect(wrapper.state('addValue')).toBe('fb');
        expect(wrapper.state('error')).toBe("'FB' is already displayed");
        expect(mockProps.socket.emit).not.toBeCalled();
      });

      it("if new symbol doesn't exist, set error", () => {
        wrapper.instance().findSymbol = jest.fn().mockReturnValueOnce(undefined);
        wrapper.setState({ busy: false, error: '', addValue: 'xyz' });

        wrapper.instance().addNew(event);

        expect(wrapper.state('busy')).toBe(false);
        expect(wrapper.state('addValue')).toBe('xyz');
        expect(wrapper.state('error')).toBe("Unknown or incorrect code");
        expect(mockProps.socket.emit).not.toBeCalled();
      });

      it('happy path', () => {
        wrapper.instance().findSymbol = jest.fn().mockReturnValue({symbol: 'abc', name: 'abc inc'});
        wrapper.setState({ busy: false, error: '', addValue: 'abc' });

        wrapper.instance().addNew(event);

        expect(wrapper.state('busy')).toBe(true);
        expect(wrapper.state('addValue')).toBe('');
        expect(wrapper.state('error')).toBe('');
        expect(mockProps.socket.emit).toBeCalledWith('add', 'ABC');
      });
    });

    describe('removeStock', () => {
      const event = {
        target: {
          name: 'FB'
        }
      }

      it('emits remove event', () => {
        expect(mockProps.socket.emit).not.toBeCalled();
        wrapper.instance().removeStock(event);
        expect(mockProps.socket.emit).toBeCalledWith('remove', event.target.name);
      });

      it('sets busy state to true', () => {
        wrapper.setState({ busy: false })
        wrapper.instance().removeStock(event);
        expect(wrapper.state('busy')).toBe(true);
      });
    });

    describe('findSymbol', () => {
      const allStockSymbols = [
        {symbol: 'FB', name: 'facebook'}
      ]

      it('returns object with symbol if exists', () => {
        wrapper.setProps({ allStockSymbols });
        const result = wrapper.instance().findSymbol('FB');
        expect(result).toEqual(allStockSymbols[0]);
      });

      it('returns undefined if not exists', () => {
        wrapper.setProps({ allStockSymbols });
        const result = wrapper.instance().findSymbol('AAPL');
        expect(result).toBeUndefined();
      });
    });
  });
});
