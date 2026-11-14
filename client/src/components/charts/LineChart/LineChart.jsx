import PropTypes from 'prop-types';
import { LineChart as RLineChart, Line } from 'recharts';
import { ChartFrame, chartTooltipStyle, axisProps, Tooltip, CartesianGrid, XAxis, YAxis } from '../ChartFrame';

const COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626'];

const LineChart = ({ data = [], xKey = 'month', series = [], title, height = 260, className }) => (
  <ChartFrame title={title} height={height} className={className} ariaLabel={`${title || 'Line'} chart`}>
    <RLineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-100 dark:stroke-gray-800" />
      <XAxis dataKey={xKey} {...axisProps} />
      <YAxis {...axisProps} />
      <Tooltip contentStyle={chartTooltipStyle} />
      {series.map((key, index) => (
        <Line
          key={key}
          type="monotone"
          dataKey={key}
          stroke={COLORS[index % COLORS.length]}
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
        />
      ))}
    </RLineChart>
  </ChartFrame>
);

LineChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  xKey: PropTypes.string,
  series: PropTypes.arrayOf(PropTypes.string),
  title: PropTypes.string,
  height: PropTypes.number,
  className: PropTypes.string,
};

export { LineChart };
export default LineChart;
