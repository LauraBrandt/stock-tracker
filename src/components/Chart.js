import React from 'react';
import PropTypes from 'prop-types';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

const Chart = props => {
  return (
    <ResponsiveContainer width={props.chartData.length < 150 ? '99%' : `${props.chartData.length * 1}%`} height={400} style={{margin: 'auto'}}>
      <LineChart data={props.chartData}>
        {
          props.chartData.length !== 0 &&

          props.stockSymbols.map((symbol, i) => 
            <Line 
              key={symbol} 
              type="linear" 
              dataKey={symbol} 
              stroke={props.colors[i]} 
              dot={false} 
              animationDuration={500} 
              connectNulls={true}
            />
          )
        }
        <CartesianGrid stroke="#777" vertical={false} />

        <XAxis 
          dataKey="label" 
          tickFormatter={tick => tick.slice(5,11)}
          padding={{ left: 5, right: 5 }}
          stroke="#d5d5d5"
          axisLine={{stroke: '#aaa'}}
          tickLine={{stroke: '#aaa'}}
          tickMargin={5}
        />

        <YAxis 
          domain={['dataMin - 2', 'auto']} 
          stroke="#bbb"
          axisLine={{stroke: '#aaa'}}
          tickLine={{stroke: '#aaa'}}
          tickMargin={5}
          orientation='right'
        />

        <Tooltip 
          animationDuration={100} 
          animationEasing="linear"
          wrapperStyle={{backgroundColor: '#222', borderRadius: 2}}
          itemStyle={{padding: '1px 3px 2px 3px', fontSize: '0.9em'}}
          labelStyle={{padding: '2px 3px 5px 3px', fontSize: '0.95em', color: '#ddd'}}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

Chart.propTypes = {
  stockSymbols: PropTypes.arrayOf(PropTypes.string),
  chartData: PropTypes.arrayOf(PropTypes.object),
  colors: PropTypes.arrayOf(PropTypes.string)
};

export default Chart;
