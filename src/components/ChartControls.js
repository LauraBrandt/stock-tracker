import React from 'react';
import PropTypes from 'prop-types';

const ChartControls = props => {
  return (
    <div className="chart-controls">
      <div className="chart-controls__period">
        <div>Period:</div>
        {props.periods.map(period => 
          <button 
            key={period} 
            className={props.current === period ? 'current' : ''}
            name={period}
            onClick={props.current === period ? () => {} : props.handlePeriodChange}
          >
            {period}
          </button>
        )}
      </div>
      <div className="chart-controls__date">
        <div className="chart_controls__date-error">{props.dateError}</div>
        <label htmlFor="from">From:</label>
        <input type="date" id="from" value={props.startDate} onChange={props.handleDateChange}/>
        <label htmlFor="to">To:</label>
        <input type="date" id="to" value={props.endDate} onChange={props.handleDateChange}/>
      </div>
    </div>
  );
}

ChartControls.propTypes = {
  periods: PropTypes.arrayOf(PropTypes.string),
  current: PropTypes.string,
  handlePeriodChange: PropTypes.func
};

export default ChartControls;