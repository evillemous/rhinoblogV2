import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';

const AdminLink = () => {
  const [, setLocation] = useLocation();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Admin Access</h1>
        
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-black dark:text-white mb-4">
              Click the button below to access the Admin Dashboard:
            </p>
            
            <Button 
              onClick={() => setLocation('/admin')}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-md text-lg"
            >
              GO TO ADMIN DASHBOARD
            </Button>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-2 text-black dark:text-white">Admin Credentials</h2>
            <p className="text-black dark:text-white">Username: <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">admin</span></p>
            <p className="text-black dark:text-white">Password: <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">rhinoadmin123</span></p>
          </div>

          <div className="text-center mt-4">
            <Button
              onClick={() => setLocation('/')}
              variant="outline"
              className="text-gray-600 dark:text-gray-300"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLink;