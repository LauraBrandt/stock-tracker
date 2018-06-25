import React from 'react';
import PropTypes from 'prop-types';
import Stock from '../components/Stock';
import AddStock from '../components/AddStock';
import '../styles/StockList.css';

class StockList extends React.Component {
  constructor() {
    super();

    this.state = {
      error: '',
      addValue: '',
      prices: {},
      interval: null,
      busy: true
    }

    this.callFetchPrice = this.callFetchPrice.bind(this);
    this.handleAddChange = this.handleAddChange.bind(this);
    this.addNew = this.addNew.bind(this);
    this.removeStock = this.removeStock.bind(this);
    this.findSymbol = this.findSymbol.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ busy: false });

    if (nextProps.stockSymbols.length > 0 && JSON.stringify(nextProps.stockSymbols) !== JSON.stringify(this.props.stockSymbols)) {
      // Get real-time stock prices (updated every 30s)
      this.callFetchPrice(nextProps.stockSymbols);
      clearInterval(this.state.interval);
      const interval = setInterval(this.callFetchPrice.bind(null, nextProps.stockSymbols), 30000);
      this.setState({ interval });
    }
  }

  componentWillUnmount() {
    clearInterval(this.state.interval);
  }

  callFetchPrice(stockSymbols) {
    fetch(`https://api.iextrading.com/1.0/stock/market/batch?types=price&symbols=${stockSymbols.join(',')}`)
    .then(response => response.json())
    .then(prices => this.setState({ prices }))
    .catch(err => {
      console.log(err);
      this.setState({ busy: false });
    });
  }

  handleAddChange(e) {
    this.setState({ addValue: e.target.value });
  }

  addNew(e) {
    e.preventDefault();

    if (this.props.stockSymbols.length === 100) return;

    this.setState({ busy: true });

    const newSymbol = this.state.addValue.toUpperCase();

    const symbolExists = this.findSymbol(newSymbol);

    if (this.props.stockSymbols.includes(newSymbol)) {
      this.setState({ busy: false, error: `'${newSymbol}' is already displayed` });
    } else if (!symbolExists) {
      this.setState({ busy: false, error: "Unknown or incorrect code" });
    } else {
      this.props.socket.emit('add', this.state.addValue);
      this.setState({ addValue: '' });
    }
  }

  removeStock(e) {
    this.props.socket.emit('remove', e.target.name);
    this.setState({ busy: true });
  }

  findSymbol(symbol) {
    return this.props.allStockSymbols.find(elem => elem.symbol === symbol);
  }

  render() {
    const { error, addValue, prices, busy } = this.state;
    const { stockSymbols, colors, allStockSymbols } = this.props;
    return (
      <div className="stock-list">
        <div>
          { stockSymbols.map((symbol, i) => 
            <li className="stock__li" key={symbol}>
              <Stock 
                symbol={symbol}
                name={(this.findSymbol(symbol) && this.findSymbol(symbol).name) || ''}
                price={prices[symbol] && prices[symbol].price}
                color={colors[i]}
                handleRemove={this.removeStock}
                disabled={busy}
              />
            </li>
          )}
        </div>
        { stockSymbols.length < 100 &&
          <AddStock 
            error={error}
            value={addValue}
            handleChange={this.handleAddChange}
            handleSubmit={this.addNew} 
            disabled={busy}
            allStockSymbols={allStockSymbols}
          />
        }
      </div>
    );
  }
}

StockList.propTypes = {
  stockSymbols: PropTypes.arrayOf(PropTypes.string),
  colors: PropTypes.arrayOf(PropTypes.string),
  allStockSymbols: PropTypes.arrayOf(PropTypes.object)
};

export default StockList;