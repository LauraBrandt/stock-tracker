# Stock Tracker

## Overview
Displays a graph of recent trend lines of stocks chosen by users. Based on the web application challenges at [FreeCodeCamp](https://learn.freecodecamp.org/coding-interview-prep/take-home-projects/chart-the-stock-market).

### User stories
* Users can view a graph displaying the recent trend lines for each added stock.
* Users can add new stocks by their symbol name.
* Users can remove stocks.
* Users can see changes in real-time when any other user adds or removes a stock. 

View live version: http://lb-stock-tracker.herokuapp.com

## Built with
* [Express](https://expressjs.com) / [NodeJS](https://nodejs.org/)
* [Mongoose](http://mongoosejs.com)
* [React](https://reactjs.org)
* [Recharts](http://recharts.org)
* [Socket.io](https://socket.io)
* [IEX API](https://iextrading.com/developer/)

## How to use
#### Clone the Github repo

``` 
$ git clone https://github.com/LauraBrandt/stock-tracker.git 
```

#### Install dependencies

```
$ npm install 
```

#### Set environment variables
 ```
 # Database URI
 DB_URL=<YOUR_DATABASE_URI>
 
 # Server URL
 REACT_APP_SERVER_URL=<YOUR_URL>
 ```

#### Build the app for production
```
$ npm run build
```

#### Start the server
```
$ npm start
```

Open <http://localhost:3001/> to see the app.
