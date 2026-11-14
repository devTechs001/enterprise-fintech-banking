import PropTypes from 'prop-types';
import { PieChart as RPieChart, Pie, Cell, Legend } from 'recharts';
import { ChartFrame, chartTooltipStyle, Tooltip } from '../ChartFrame';

const PALETTE = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#db2777', '#65a30d'];

const PieChart = ({ data = [], nameKey = 'category', valueKey = 'total', title, height = 260, donut = false, className }) => (
  <ChartFrame title={title} height={height} className={className} ariaLabel={`${title || 'Pie'} chart`}>
    <RPieChart>
      <Tooltip contentStyle={chartTooltipStyle} />
      <Pie
        data={data}
        dataKey={valueKey}
        nameKey={nameKey}
        cx="50%"
        cy="50%"
        outerRadius="72%"
        innerRadius={donut ? '46%' : 0}
        paddingAngle={donut ? 2 : 0}
        stroke="none"
      >
        {data.map((entry, index) => (
          <Cell key={entry[nameKey] ?? index} fill={PALETTE[index % PALETTE.length]} />
        ))}
      </Pie>
      <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
    </RPieChart>
  </ChartFrame>
);

PieChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  nameKey: PropTypes.string,
  valueKey: PropTypes.string,
  title: PropTypes.string,
  height: PropTypes.number,
  donut: PropTypes.bool,
  className: PropTypes.string,
};

export { PieChart };
export default PieChart;
