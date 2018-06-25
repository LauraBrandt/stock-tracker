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
      stocks: {},
      busy: false
    }

    this.callFetch = this.callFetch.bind(this);
    this.handleAddChange = this.handleAddChange.bind(this);
    this.addNew = this.addNew.bind(this);
    this.removeStock = this.removeStock.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.stockSymbols.length > 0 && JSON.stringify(nextProps.stockSymbols) !== JSON.stringify(this.props.stockSymbols)) {
      this.callFetch(nextProps.stockSymbols);
    }
  }

  callFetch(stockSymbols) {
    fetch(`https://api.iextrading.com/1.0/stock/market/batch?types=quote&symbols=${stockSymbols.join(',')}`)
      .then(response => response.json())
      .then(stocks => this.setState({ stocks, busy: false }))
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

    fetch(`https://api.iextrading.com/1.0/stock/${this.state.addValue}/company`)
      .then(response => response.json())
      .then(() => {
    this.props.socket.emit('add', this.state.addValue);
        this.setState({ addValue: '' });
      })
      .catch(err => {
        if (err.constructor.name === 'SyntaxError') {
          this.setState({ busy: false, error: "Unknown or incorrect code" });
        } else {
          console.log(err);
        }
      });
  }

  removeStock(e) {
    this.props.socket.emit('remove', e.target.name);
    this.setState({ busy: true });
  }

  render() {
    const { error, addValue, stocks, busy } = this.state;
    const { stockSymbols, colors } = this.props;
    return (
      <div className="stock-list">
        { Object.keys(stocks).length !== 0 &&
          <div>
            { stockSymbols.map((symbol, i) => 
              <li className="stock__li" key={symbol}>
                <Stock 
                  symbol={symbol}
                  name={(stocks[symbol] && stocks[symbol].quote.companyName) || ''}
                  color={colors[i]}
                  handleRemove={this.removeStock}
                  disabled={busy}
                />
              </li>
            )}
          </div>
        }
        { stockSymbols.length < 100 &&
          <AddStock 
            error={error}
            value={addValue}
            handleChange={this.handleAddChange}
            handleSubmit={this.addNew} 
            disabled={busy}
          />
        }
      </div>
    );
  }
}

StockList.propTypes = {
  stockSymbols: PropTypes.arrayOf(PropTypes.string),
  colors: PropTypes.arrayOf(PropTypes.string)
};

export default StockList;