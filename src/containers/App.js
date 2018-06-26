import React from 'react';
import ChartContainer from './ChartContainer';
import StockList from './StockList';
import '../styles/App.css';
import io from "socket.io-client";

// import { stockSymbols } from '../data';

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      allStockSymbols: [],
      stockSymbols: [],
      colors: [],
      socket: io('Lauras-MacBook-Pro.local:3001')
    }

    this.fetchSymbolList = this.fetchSymbolList.bind(this);
    this.getColorList = this.getColorList.bind(this);
  }

  componentDidMount() {
    this.fetchSymbolList();

    this.state.socket.emit('get', null);

    this.state.socket.on("symbolList", stockSymbols => {
      if (stockSymbols.length > 0) {
        const colors = this.getColorList(stockSymbols);
        this.setState({ stockSymbols, colors });
      }
    });
  }

  fetchSymbolList() {
    fetch('https://api.iextrading.com/1.0/ref-data/symbols')
      .then(response => response.json())
      .then(allStockSymbols => this.setState({ allStockSymbols }))
      .catch(err => console.log(err));
  }

  getColorList(symbols) {
    return symbols.map(() => {
      const hue = Math.floor(Math.random() * 256);
      return `hsl(${hue}, 50%, 70%)`
    });
  }

  render() {
    const { stockSymbols, colors, socket, allStockSymbols } = this.state;
    return (
      <div className="app">
        <ChartContainer 
          stockSymbols={stockSymbols} 
          colors={colors}
        />
        <StockList 
          stockSymbols={stockSymbols} 
          colors={colors} 
          socket={socket}
          allStockSymbols={allStockSymbols}
        />
        <footer className="footer">
          <div>Data provided for free by <a href="https://iextrading.com/developer">IEX</a>. View <a href="https://iextrading.com/api-exhibit-a/">IEX’s Terms of Use</a>.</div>
          <div>Designed and coded by <a href="https://github.com/LauraBrandt">Laura Brandt</a></div>
        </footer>
      </div>
    );
  }
}

export default App;
