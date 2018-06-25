const Symbol = require('../../models/symbols');

const symbolController = {
  getSymbols: cb => {
    Symbol.find({}, (err, symbols) => {
      if (err) return handleError(err); // todo
      const symbolList = symbols.map(symbolObject => symbolObject.name);
      cb(symbolList);
    });
  },

  addSymbol: (symbol, cb) => {
    Symbol.find({}, (err, symbols) => {
      if (err) return handleError(err); // todo
      const symbolList = symbols.map(symbolObject => symbolObject.name);
      
      const newSymbol = new Symbol({name: symbol});
      newSymbol.save((err, symbol) => {
        if (err) return handleError(err); // todo
        symbolList.push(symbol.name);
        cb(symbolList);
      });
    });
  },

  removeSymbol: (symbol, cb) => {
    Symbol.find({}, (err, symbols) => {
      if (err) return handleError(err); // todo
      const symbolList = symbols.map(symbolObject => symbolObject.name);
      
      Symbol.deleteOne({ name: symbol }, err => {
        if (err) return handleError(err); // todo

        const index = symbolList.indexOf(symbol);
        symbolList.splice(index, 1);
        cb(symbolList);
      });
    });
    
  }
}

module.exports = symbolController;