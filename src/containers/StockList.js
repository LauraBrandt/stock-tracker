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
      stocks: {}
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
        .then(stocks => this.setState({ stocks }))
        .catch(err => console.log(err));
  }

  handleAddChange(e) {
    this.setState({ addValue: e.target.value });
  }

  addNew(e) {
    e.preventDefault();

    this.setState({ addValue: '' });
    
    if (this.props.stockSymbols.length === 100) return;

    // eventually set 'adding' to true, so that form is disabled until finished adding
    
  }

  removeStock(e) {
    console.log('about to remove', e.target.name)
  }

  render() {
    const { error, addValue, stocks } = this.state;
    const { stockSymbols, colors } = this.props;
    return (
      <div className="stock-list">
        { Object.keys(stocks).length !== 0 &&
          <div>
            { stockSymbols.map((symbol, i) => 
              <li className="stock__li" key={symbol}>
                <Stock 
                  symbol={symbol}
                  name={stocks[symbol].quote.companyName}
                  color={colors[i]}
                  handleRemove={this.removeStock}
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