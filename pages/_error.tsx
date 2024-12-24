import { NextPage, NextPageContext } from 'next';

interface CustomErrorProps {
  statusCode: number;
  err?: Error;
  hasGetInitialPropsRun?: boolean;
}

const CustomError: NextPage<CustomErrorProps> = ({ statusCode, err }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {statusCode
                ? `An error ${statusCode} occurred on server`
                : 'An error occurred on client'}
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              {err?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

CustomError.getInitialProps = async ({ res, err }: NextPageContext): Promise<CustomErrorProps> => {
  const statusCode = res ? res.statusCode : err ? 500 : 404;
  return { statusCode };
};

export default CustomError;
