import React from 'react';
import PropTypes from 'prop-types';

const Stock = props => {
  return (
    <div className="stock" style={{borderColor: props.color}}>
      <span className="stock__symbol">{props.symbol}</span>
      <span className="stock__name">{props.name}</span>
      <button className="stock__remove" onClick={props.handleRemove} name={props.symbol}>&times;</button>
    </div>
  );
}

Stock.propTypes = {
  symbol: PropTypes.string,
  name: PropTypes.string,
  color: PropTypes.string,
  handleRemove: PropTypes.func
};

export default Stock;