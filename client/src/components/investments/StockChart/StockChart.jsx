import PropTypes from 'prop-types';
import { AreaChart } from '@/components/charts';

/** Price history for a holding, rendered as an area chart. */
const StockChart = ({ data = [], title = 'Price history', height = 220 }) => (
  <AreaChart data={data} xKey="date" series={['price']} title={title} height={height} />
);

StockChart.propTypes = { data: PropTypes.arrayOf(PropTypes.object), title: PropTypes.string, height: PropTypes.number };

export { StockChart };
export default StockChart;
