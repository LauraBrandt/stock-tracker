import React from 'react';
import ChartContainer from './ChartContainer';
import StockList from './StockList';
import '../styles/App.css';
import io from "socket.io-client";

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      allStockSymbols: [],
      stockSymbols: [],
      colors: [],
      socket: null,
      error: ''
    }

    this.startSocket = this.startSocket.bind(this);
    this.fetchSymbolList = this.fetchSymbolList.bind(this);
    this.getColorList = this.getColorList.bind(this);
  }

  componentDidMount() {
    this.fetchSymbolList();

    const socket = this.startSocket(io);
    this.setState({ socket });

    socket.emit('get', null);

    socket.on("symbolList", stockSymbols => {
      if (stockSymbols.length > 0) {
        const colors = this.getColorList(stockSymbols);
        this.setState({ stockSymbols, colors });
      }
    });
  }

  startSocket(io) {
    return io(process.env.REACT_APP_SERVER_URL);
  }

  fetchSymbolList() {
    return fetch('https://api.iextrading.com/1.0/ref-data/symbols')
      .then(response => response.json())
      .then(allStockSymbols => this.setState({ allStockSymbols }))
      .catch(err => this.setState({ error: err.message }));
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
