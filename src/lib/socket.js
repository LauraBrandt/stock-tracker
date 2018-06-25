const socketIo = require('socket.io');
const symbolController = require('./src/lib/symbolController');

const socketController = server => {
  const io = socketIo(server);  
  
  io.on('connection', socket => {  
    console.log('User Connected');
    
    socket.on('get', () => {
      symbolController.getSymbols(symbolList => {
        socket.emit("symbolList", symbolList);
      });
    });
    
    socket.on('add', data => {
      data = data.toUpperCase();
      symbolController.addSymbol(data, symbolList => {
        io.emit('symbolList', symbolList);
      });
    });
    
    socket.on('remove', data => {
      symbolController.removeSymbol(data, symbolList => {
        io.emit('symbolList', symbolList);
      });
    });
    
    socket.on('error', err => {
      console.log('Received error from user:', socket.id);
      console.log(err);
    })
    
    socket.on('disconnect', () => {
      console.log('User Disconnected', socket.id);
    });
  });
}

module.exports = socketController;