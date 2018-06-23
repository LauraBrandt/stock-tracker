import React from 'react';
import ChartContainer from './ChartContainer';
import StockList from './StockList';
import '../styles/App.css';

import { stockSymbols } from '../data';

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      stockSymbols: [],
      stockCharts: [], 
      colors: []
    }
  }

  componentDidMount() {
    // all within cb of db call
    const colors = stockSymbols.map(s => {
      const hue = Math.floor(Math.random() * 256);
      return `hsl(${hue}, 40%, 70%)`
    });
    
    this.setState({ stockSymbols, colors });
  }

  render() {
    const { stockSymbols, colors } = this.state;
    return (
      <div className="app">
        <ChartContainer stockSymbols={stockSymbols} colors={colors} />
        <StockList stockSymbols={stockSymbols} colors={colors} />
        <footer className="footer">
          <div>Data provided for free by IEX. View <a href="https://iextrading.com/api-exhibit-a/">IEX’s Terms of Use</a>.</div>
          <div>Designed and coded by <a href="https://github.com/LauraBrandt">Laura Brandt</a></div>
        </footer>
      </div>
    );
  }
}

export default App;
