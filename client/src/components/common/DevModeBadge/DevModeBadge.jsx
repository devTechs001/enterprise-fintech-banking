import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { FlaskConical } from 'lucide-react';

import { DEV_MODE, MOCK_MODE, APP_VERSION } from '@/config/env';

/**
 * Visible marker that the running app is a development build.
 *
 * A banking UI that silently serves mock balances is dangerous: someone demoing
 * it can mistake $18,420.55 of in-memory fiction for a real account. The badge
 * makes the mode unmistakable, and clicking it opens the dev console.
 *
 * `enabled` defaults to the build-time flag. In a production bundle `DEV_MODE`
 * is the literal `false`, so this component's entire body is dead code the
 * minifier strips — production does not hide the badge, it does not contain it.
 * The prop exists so tests can assert both states without rebuilding.
 */
const DevModeBadge = ({ enabled = DEV_MODE, mock = MOCK_MODE, version = APP_VERSION }) => {
  const navigate = useNavigate();

  // The literal `import.meta.env.DEV` (not the helper) so that in a production bundle
  // this is `if (!false ...) return null` — wait, the inverse: DEV is false in prod,
  // so the guard fires and everything below it is unreachable. The minifier then
  // drops the JSX and its strings, so production ships neither the badge UI nor the
  // words "DEV MODE". `enabled` stays a prop so tests can assert both states under a
  // dev-server env.
  if (!import.meta.env.DEV || !enabled) return null;

  return (
    <button
      type="button"
      onClick={() => navigate('/dev')}
      title="Development mode — open the dev console"
      aria-label={`Development mode${mock ? ' with mock data' : ''}. Open the dev console.`}
      className="fixed bottom-4 left-4 z-[70] flex items-center gap-2 rounded-full border border-warning-400/60 bg-warning-50/95 px-3 py-1.5 text-xs font-semibold text-warning-800 shadow-lg backdrop-blur dark:border-warning-500/40 dark:bg-warning-900/80 dark:text-warning-200"
    >
      <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
      DEV MODE
      <span className="font-normal opacity-80">
        {mock ? 'mock data · no real money' : 'dev server'} · v{version}
      </span>
    </button>
  );
};

DevModeBadge.propTypes = {
  enabled: PropTypes.bool,
  mock: PropTypes.bool,
  version: PropTypes.string,
};

export { DevModeBadge };
export default DevModeBadge;
