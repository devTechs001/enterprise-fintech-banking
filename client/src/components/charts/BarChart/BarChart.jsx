import PropTypes from 'prop-types';
import { BarChart as RBarChart, Bar } from 'recharts';
import { ChartFrame, chartTooltipStyle, axisProps, Tooltip, CartesianGrid, XAxis, YAxis } from '../ChartFrame';

const BarChart = ({ data = [], xKey = 'category', valueKey = 'total', title, height = 260, color = '#2563eb', className }) => (
  <ChartFrame title={title} height={height} className={className} ariaLabel={`${title || 'Bar'} chart`}>
    <RBarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-100 dark:stroke-gray-800" />
      <XAxis dataKey={xKey} {...axisProps} />
      <YAxis {...axisProps} />
      <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'rgba(148,163,184,0.12)' }} />
      <Bar dataKey={valueKey} fill={color} radius={[6, 6, 0, 0]} maxBarSize={44} />
    </RBarChart>
  </ChartFrame>
);

BarChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  xKey: PropTypes.string,
  valueKey: PropTypes.string,
  title: PropTypes.string,
  height: PropTypes.number,
  color: PropTypes.string,
  className: PropTypes.string,
};

export { BarChart };
export default BarChart;
