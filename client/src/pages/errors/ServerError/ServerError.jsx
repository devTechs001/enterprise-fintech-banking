import { ErrorLayout } from '@/components/layout/ErrorLayout/ErrorLayout';

import { Button } from '@/components/common/Button';

/**
 * 500.
 *
 * Deliberately says nothing about what failed. The server never returns a stack
 * trace or an internal message, and this page does not invent one — leaking detail
 * here would undo the error-handler work. "Try again" reloads rather than
 * navigating home, because for a transient failure reloading is what actually helps.
 */
const ServerError = () => (
  <ErrorLayout
    errorCode="500"
    title="Something went wrong"
    description="We could not complete that request. No detail is shown on purpose — error internals are never exposed to the browser."
  >
    <div className="flex justify-center">
      <Button variant="outline" onClick={() => window.location.reload()}>Try again</Button>
    </div>
  </ErrorLayout>
);

export { ServerError };
export default ServerError;
