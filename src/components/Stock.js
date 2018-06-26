import React from 'react';
import PropTypes from 'prop-types';

const Stock = props => {
  return (
    <div className="stock" style={{borderColor: props.color}}>
      <span className="stock__symbol">{props.symbol}</span>
      <span className="stock__name">{props.name}</span>
      <span className="stock__price">{props.price}</span>
      <button 
        onClick={props.disabled ? e => e.preventDefault() : props.handleRemove}
        name={props.symbol}
        className={`stock__remove${props.disabled ? ' disabled' : ''}`}
      >
        &times;
      </button>
    </div>
  );
}

Stock.propTypes = {
  symbol: PropTypes.string,
  name: PropTypes.string,
  price: PropTypes.number,
  color: PropTypes.string,
  handleRemove: PropTypes.func,
  disabled: PropTypes.bool
};

export default Stock;