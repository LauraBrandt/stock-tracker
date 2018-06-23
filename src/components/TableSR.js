import React from 'react';
import PropTypes from 'prop-types';

const TableSR = props => {
  return (
    <div className="table-sr sr-only">
      <table>
        <caption>Stocks by Date</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            {props.stockSymbols.map(symbol => <th scope="col" key={symbol}>{symbol}</th>)}
          </tr>
        </thead>
        <tbody>
          {props.chartData.map(datePoint => 
            <tr key={datePoint.date}>
              <td>{datePoint.label}</td>
              {props.stockSymbols.map(symbol => 
                <td key={symbol}>{datePoint[symbol] || null}</td>
              )}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

TableSR.propTypes = {
  stockSymbols: PropTypes.arrayOf(PropTypes.string),
  chartData: PropTypes.arrayOf(PropTypes.object),
};

export default TableSR;