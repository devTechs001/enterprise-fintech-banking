import PropTypes from 'prop-types';
import { AreaChart as RAreaChart, Area } from 'recharts';
import { ChartFrame, chartTooltipStyle, axisProps, Tooltip, CartesianGrid, XAxis, YAxis } from '../ChartFrame';

const AreaChart = ({ data = [], xKey = 'month', series = ['income', 'expenses'], title, height = 260, className }) => {
  const colors = { income: '#16a34a', expenses: '#dc2626' };
  return (
    <ChartFrame title={title} height={height} className={className} ariaLabel={`${title || 'Area'} chart`}>
      <RAreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
        <defs>
          {series.map((key) => (
            <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors[key] || '#2563eb'} stopOpacity={0.28} />
              <stop offset="95%" stopColor={colors[key] || '#2563eb'} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-100 dark:stroke-gray-800" />
        <XAxis dataKey={xKey} {...axisProps} />
        <YAxis {...axisProps} />
        <Tooltip contentStyle={chartTooltipStyle} />
        {series.map((key) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stroke={colors[key] || '#2563eb'}
            strokeWidth={2.5}
            fill={`url(#grad-${key})`}
          />
        ))}
      </RAreaChart>
    </ChartFrame>
  );
};

AreaChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  xKey: PropTypes.string,
  series: PropTypes.arrayOf(PropTypes.string),
  title: PropTypes.string,
  height: PropTypes.number,
  className: PropTypes.string,
};

export { AreaChart };
export default AreaChart;
