import PropTypes from 'prop-types';
import { ResponsiveContainer, Tooltip, CartesianGrid, XAxis, YAxis } from 'recharts';
import { cn } from '@/utils/helpers';

/**
 * Shared chart chrome.
 *
 * Wraps recharts in a ResponsiveContainer with the app's dark-mode-aware axis and
 * tooltip styling, so every chart is consistent and accessible. `title` is
 * rendered as a real heading and the SVG gets an aria-label.
 */
const ChartFrame = ({ title, height = 260, className, children, ariaLabel }) => (
  <div className={cn('w-full', className)}>
    {title && <p className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">{title}</p>}
    <div style={{ height }} role="img" aria-label={ariaLabel || title || 'Chart'}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  </div>
);

ChartFrame.propTypes = {
  title: PropTypes.string,
  height: PropTypes.number,
  className: PropTypes.string,
  children: PropTypes.element.isRequired,
  ariaLabel: PropTypes.string,
};

export const chartTooltipStyle = {
  borderRadius: 12,
  border: '1px solid rgba(148,163,184,0.3)',
  boxShadow: '0 8px 32px -8px rgba(0,0,0,0.16)',
  fontSize: 12,
};

export const axisProps = {
  stroke: 'currentColor',
  className: 'text-gray-400',
  tick: { fontSize: 11 },
  tickLine: false,
  axisLine: false,
};

export { ChartFrame, Tooltip, CartesianGrid, XAxis, YAxis };
export default ChartFrame;
