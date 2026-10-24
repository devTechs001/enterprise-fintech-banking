import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';

const ServerError = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <h1 className="text-6xl font-bold text-gray-900 dark:text-white">500</h1>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
        Something went wrong on our end. Please try again later.
      </p>
      <Link to="/" className="mt-8">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
};

export { ServerError };
export default ServerError;
