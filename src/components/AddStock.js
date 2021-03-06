import React from 'react';
import PropTypes from 'prop-types';

const AddStock = props => {
  return (
    <div className="add-stock stock">
      <form onSubmit={props.disabled ? e => e.preventDefault() : props.handleSubmit}>
        <input 
          type="text" 
          placeholder="Stock code" 
          value={props.value} 
          onChange={props.handleChange} 
          disabled={props.disabled}
          list="symbols"
        />
        <button type="submit" className={props.disabled ? 'disabled' : ''}>
          &#43;&nbsp;&nbsp;Add new
        </button>
      </form>
      <p>Syncs in realtime across clients</p>
      {props.error && <div className="error">{props.error}</div>}
      <datalist id="symbols">
        {props.allStockSymbols.map(symbolObject => 
          <option key={symbolObject.symbol} value={symbolObject.symbol} />
        )}
      </datalist>
    </div>
  );
}

AddStock.propTypes = {
  error: PropTypes.string,
  value: PropTypes.string,
  handleChange: PropTypes.func,
  handleSubmit: PropTypes.func,
  disabled: PropTypes.bool,
  allStockSymbols: PropTypes.arrayOf(PropTypes.object)
}; 

export default AddStock;