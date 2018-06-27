import React from 'react';
import { shallow } from 'enzyme';
import fetchMock from 'fetch-mock';
import App from '../../containers/App';
import ChartContainer from '../../containers/ChartContainer';
import StockList from '../../containers/StockList';
import { serverUrl } from '../../config';

describe('App', () => {
  const allStocks = [
    {
      "symbol": "A",
      "name": "AGILENT TECHNOLOGIES INC",
      "date": "2017-04-19",
      "isEnabled": true
    },
    {
      "symbol": "AA",
      "name": "ALCOA CORP",
      "date": "2017-04-19",
      "isEnabled": true
    }
  ]

  const mockSymbols = ['FB', 'AAPL']

  const mockSocket = symbols => ({
    emit: jest.fn(),
    on: jest.fn().mockImplementation((type, cb) => {
      if (type === 'symbolList') {
        cb(symbols);
      }
    })
  });

  let mockSocketObject, mockStartSocket;
  let wrapper;
  beforeEach(() => {
    mockSocketObject = mockSocket(mockSymbols);
    mockStartSocket = jest.spyOn(App.prototype, 'startSocket').mockReturnValue(mockSocketObject);
    fetchMock.get('end:/ref-data/symbols', allStocks, { overwriteRoutes: true });

    wrapper = shallow(<App />);
  });

  afterEach(() => {
    fetchMock.reset();
    mockSocketObject.emit.mockClear();
    mockSocketObject.on.mockClear();
  });

  afterAll(() => {
    fetchMock.restore();
    mockStartSocket.mockRestore();
  });

  describe('children', () => {
    it('has a ChartContainer', () => {
      expect(wrapper.find(ChartContainer)).toHaveLength(1);
    });

    it('passes correct props to ChartContainer', () => {
      const state = { 
        stockSymbols: ['FB', 'AAPL'],
        colors: ['hsl(0, 50%, 70%)', 'hsl(100, 50%, 70%)']
      }
      wrapper.setState(state);

      expect(wrapper.find(ChartContainer).prop('stockSymbols'))
        .toEqual(state.stockSymbols);
      expect(wrapper.find(ChartContainer).prop('colors'))
        .toEqual(state.colors);
    });

    it('has a StockList', () => {
      expect(wrapper.find(StockList)).toHaveLength(1);
    });

    it('passes correct props to StockList', () => {
      const state = { 
        stockSymbols: ['FB', 'AAPL'],
        colors: ['hsl(0, 50%, 70%)', 'hsl(100, 50%, 70%)'],
        allStockSymbols: allStocks, 
        socket: mockSocketObject
      }
      wrapper.setState(state);

      expect(wrapper.find(StockList).prop('stockSymbols'))
        .toEqual(state.stockSymbols);
      expect(wrapper.find(StockList).prop('colors'))
        .toEqual(state.colors);
      expect(wrapper.find(StockList).prop('socket'))
        .toEqual(state.socket);
      expect(wrapper.find(StockList).prop('allStockSymbols'))
        .toEqual(state.allStockSymbols);
    });
    
    it('has a footer', () => {
      expect(wrapper.find('footer')).toHaveLength(1);
    });

    it('has attribution for IEX', () => {
      expect(wrapper.find('footer').text()).toContain('IEX');
      expect(wrapper.find('footer a').at(0).prop('href')).toContain('iextrading.com');
    });
  });

  describe('methods', () => {
    describe('componentDidMount', () => {
      it('calls fetchSymbolList on mount', () => {
        const fetchSymbolListSpy = jest.spyOn(App.prototype, 'fetchSymbolList');
        wrapper = shallow(<App />);
        expect(fetchSymbolListSpy).toHaveBeenCalled();
        fetchSymbolListSpy.mockRestore();
      });

      it('calls startSocket on mount', () => {
        expect(mockStartSocket).toHaveBeenCalled();
      });

      it('sets state with new socket value on mount', () => {
        expect(wrapper.state('socket')).toEqual(mockSocketObject);
      });

      it('sets state with new socket value on mount', () => {
        expect(wrapper.state('socket')).toEqual(mockSocketObject);
      });

      it('calls socket.emit with "get" on mount', () => {
        expect(mockSocketObject.emit).toBeCalledWith('get', null);
      });
      
      it('calls socket.on with "symbolList" on mount', () => {
        expect(mockSocketObject.on.mock.calls[0][0]).toBe('symbolList');
      });

      it('socket.on callback works', () => {
        const getColorList = jest.spyOn(App.prototype, 'getColorList');
        wrapper = shallow(<App />);
        expect(getColorList).toHaveBeenCalled();
        getColorList.mockRestore();

        expect(wrapper.state('stockSymbols')).toEqual(['FB', 'AAPL']);
        expect(wrapper.state('colors').length).toBe(2);
      });

      it('socket.on callback does nothing if stockSymbols empty', () => {
        mockSocketObject = mockSocket([]);
        mockStartSocket = jest.spyOn(App.prototype, 'startSocket').mockReturnValue(mockSocketObject);
        const getColorList = jest.spyOn(App.prototype, 'getColorList');
        
        wrapper = shallow(<App />);

        expect(mockSocketObject.on.mock.calls[0][0]).toBe('symbolList');
        expect(getColorList).not.toHaveBeenCalled();
        expect(wrapper.state('stockSymbols')).toEqual([]);
        expect(wrapper.state('colors').length).toBe(0);

        getColorList.mockRestore();
      });
    });

    describe('fetchSymbolList', () => {
      it('calls fetch with symbols endpoint', () => {
        fetchMock.reset();

        wrapper.instance().fetchSymbolList();
        expect(fetchMock.called('end:/ref-data/symbols')).toBe(true);
      });

      it('sets state with fetch return value', () => {
        expect.assertions(1);
        fetchMock.reset();

        wrapper.instance().fetchSymbolList().then(() => {
          expect(wrapper.state('allStockSymbols')).toEqual(allStocks);
        });
      });
      
      it('sets state with error on fetch errors', () => {
        expect.assertions(2);

        fetchMock.get('end:/ref-data/symbols', () => {
          throw new Error('Some Error')
        }, { overwriteRoutes: true });
        
        wrapper = shallow(<App />);
        fetchMock.reset();

        wrapper.instance().fetchSymbolList().then(() => {
          expect(wrapper.state('error')).toEqual('Some Error');
          expect(wrapper.state('allStockSymbols')).toEqual([]);
        });
      });
    });

    describe('getColorList', () => {
      it('has correct number of colors in array', () => {
        const symbols = ['FB', 'AAPL']
        const colors = wrapper.instance().getColorList(symbols);
        expect(colors.length).toBe(symbols.length);
      });

      it('each color has the correct format', () => {
        const symbols = new Array(10).fill('');
        const colors = wrapper.instance().getColorList(symbols);
        colors.forEach(color => {
          const parts = color.split(', ');
          expect(parts[0].slice(0,4)).toBe('hsl(');
          expect(parseInt(parts[0].slice(4))).toBeGreaterThanOrEqual(0);
          expect(parseInt(parts[0].slice(4))).toBeLessThan(256);
          expect(parts[1]).toBe('50%');
          expect(parts[2]).toBe('70%)');
        });
      });
    });

    describe('startSocket', () => {
      it('is called with correct url', () => {
        const mockIo = jest.fn();
        mockStartSocket.mockRestore();
        wrapper = shallow(<App />);

        wrapper.instance().startSocket(mockIo);

        expect(mockIo).toHaveBeenCalledWith(serverUrl);
      });
    });
  });
});
