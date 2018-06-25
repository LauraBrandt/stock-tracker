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
      stockSymbols: [],
      colors: [],
      socket: io('Lauras-MacBook-Pro.local:3001')
    }
  }

  componentDidMount() {
    this.state.socket.emit('get', '');

    this.state.socket.on("symbolList", stockSymbols => {
      if (stockSymbols.length > 0) {
        const colors = stockSymbols.map(s => {
          const hue = Math.floor(Math.random() * 256);
          return `hsl(${hue}, 40%, 70%)`
        });
        
        this.setState({ stockSymbols, colors });
      }
    });
  }

  render() {
    const { stockSymbols, colors, socket } = this.state;
    return (
      <div className="app">
        <ChartContainer stockSymbols={stockSymbols} colors={colors}/>
        <StockList stockSymbols={stockSymbols} colors={colors} socket={socket}/>
        <footer className="footer">
          <div>Data provided for free by IEX. View <a href="https://iextrading.com/api-exhibit-a/">IEX’s Terms of Use</a>.</div>
          <div>Designed and coded by <a href="https://github.com/LauraBrandt">Laura Brandt</a></div>
        </footer>
      </div>
    );
  }
}

export default App;
