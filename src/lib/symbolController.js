const Symbol = require('../../models/symbols');

const handleError = err => console.log(err);

const symbolController = {
  getSymbols: cb => {
    Symbol.find({}, (err, symbols) => {
      if (err) return handleError(err);
      const symbolList = symbols.map(symbolObject => symbolObject.name);
      cb(symbolList);
    });
  },

  addSymbol: (symbol, cb) => {
    Symbol.find({}, (err, symbols) => {
      if (err) return handleError(err);
      const symbolList = symbols.map(symbolObject => symbolObject.name);
      if (symbolList.length === 100) {
        return symbolList;
      }
      
      const newSymbol = new Symbol({name: symbol});
      newSymbol.save((err, symbol) => {
        if (err) return handleError(err);
        symbolList.push(symbol.name);
        cb(symbolList);
      });
    });
  },

  removeSymbol: (symbol, cb) => {
    Symbol.find({}, (err, symbols) => {
      if (err) return handleError(err);
      const symbolList = symbols.map(symbolObject => symbolObject.name);
      
      Symbol.deleteOne({ name: symbol }, err => {
        if (err) return handleError(err);

        const index = symbolList.indexOf(symbol);
        symbolList.splice(index, 1);
        cb(symbolList);
      });
    });
  }
}

module.exports = symbolController;