import PropTypes from 'prop-types';
import { PieChart as RPieChart, Pie, Cell } from 'recharts';
import { ChartFrame, chartTooltipStyle, Tooltip } from '../ChartFrame';

const PALETTE = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#db2777', '#65a30d'];

/** Donut with an optional centre readout (e.g. total spend). */
const DonutChart = ({ data = [], nameKey = 'category', valueKey = 'total', centreLabel, centreValue, title, height = 260, className }) => {
  const total = data.reduce((sum, row) => sum + (Number(row[valueKey]) || 0), 0);
  return (
    <ChartFrame title={title} height={height} className={className} ariaLabel={`${title || 'Donut'} chart`}>
      <RPieChart>
        <Tooltip contentStyle={chartTooltipStyle} />
        <Pie data={data} dataKey={valueKey} nameKey={nameKey} cx="50%" cy="50%" innerRadius="58%" outerRadius="82%" paddingAngle={2} stroke="none">
          {data.map((entry, index) => (
            <Cell key={entry[nameKey] ?? index} fill={PALETTE[index % PALETTE.length]} />
          ))}
        </Pie>
        <text x="50%" y="47%" textAnchor="middle" className="fill-gray-500 text-[11px] dark:fill-gray-400">
          {centreLabel ?? 'Total'}
        </text>
        <text x="50%" y="57%" textAnchor="middle" className="fill-gray-900 text-lg font-bold dark:fill-white">
          {centreValue ?? total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </text>
      </RPieChart>
    </ChartFrame>
  );
};

DonutChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  nameKey: PropTypes.string,
  valueKey: PropTypes.string,
  centreLabel: PropTypes.string,
  centreValue: PropTypes.string,
  title: PropTypes.string,
  height: PropTypes.number,
  className: PropTypes.string,
};

export { DonutChart };
export default DonutChart;
