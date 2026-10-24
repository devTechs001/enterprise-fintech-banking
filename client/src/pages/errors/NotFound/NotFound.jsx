import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <h1 className="text-6xl font-bold text-gray-900 dark:text-white">404</h1>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link to="/" className="mt-8">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
};

export { NotFound };
export default NotFound;
