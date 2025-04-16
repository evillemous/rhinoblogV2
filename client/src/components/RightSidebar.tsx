import { Button } from "@/components/ui/button";

const RightSidebar = () => {
  return (
    <aside className="hidden xl:block w-72 flex-shrink-0 pl-6">
      {/* Featured Post */}
      <div className="bg-white dark:bg-reddit-darkCard rounded-md shadow mb-4 overflow-hidden">
        <div className="bg-reddit-blue p-4">
          <h2 className="text-white font-ibm-plex font-bold">Featured Post</h2>
        </div>
        <div className="p-4">
          <h3 className="font-ibm-plex font-medium text-sm mb-2">Essential Rhinoplasty Recovery Guide: What to Buy Before Surgery</h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">The complete list of everything you need for a comfortable recovery, from must-haves to nice-to-haves.</p>
          <Button className="w-full bg-reddit-blue text-white hover:bg-blue-600 text-xs py-1.5 rounded-full">Read Now</Button>
        </div>
      </div>
      
      {/* Server Stats */}
      <div className="bg-white dark:bg-reddit-darkCard rounded-md shadow mb-4">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-ibm-plex font-bold">Community Stats</h2>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm">
              <span className="font-medium text-base">14,283</span>
              <p className="text-gray-500 dark:text-gray-400">Members</p>
            </div>
            <div className="text-sm">
              <span className="font-medium text-base">342</span>
              <p className="text-gray-500 dark:text-gray-400">Online</p>
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <div className="flex justify-between mb-1">
              <span>Created</span>
              <span>January 15, 2023</span>
            </div>
            <div className="flex justify-between">
              <span>Posts per day</span>
              <span>~24</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Upcoming AMAs */}
      <div className="bg-white dark:bg-reddit-darkCard rounded-md shadow mb-4">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-ibm-plex font-bold">Upcoming AMAs</h2>
        </div>
        <div className="p-4">
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-1">Dr. Sarah Johnson - Revision Specialist</h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">June 15, 2023 • 2:00 PM EST</p>
            <span className="inline-block bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs px-2 py-0.5 rounded-full">Verified Surgeon</span>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-1">Miguel R. - 2 Years Post-Op Journey</h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">June 22, 2023 • 6:00 PM EST</p>
            <span className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-0.5 rounded-full">Community Member</span>
          </div>
        </div>
      </div>
      
      {/* Popular Resources */}
      <div className="bg-white dark:bg-reddit-darkCard rounded-md shadow">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-ibm-plex font-bold">Essential Resources</h2>
        </div>
        <div className="p-4">
          <ul className="text-sm space-y-3">
            <li>
              <a href="#" className="flex items-center text-reddit-blue hover:underline">
                <i className="fas fa-book-medical mr-2 text-xs"></i>
                <span>Rhinoplasty Recovery Timeline</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center text-reddit-blue hover:underline">
                <i className="fas fa-question-circle mr-2 text-xs"></i>
                <span>Questions to Ask Your Surgeon</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center text-reddit-blue hover:underline">
                <i className="fas fa-camera mr-2 text-xs"></i>
                <span>How to Take Good Before Photos</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center text-reddit-blue hover:underline">
                <i className="fas fa-search-dollar mr-2 text-xs"></i>
                <span>Financing Options Guide</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center text-reddit-blue hover:underline">
                <i className="fas fa-exclamation-triangle mr-2 text-xs"></i>
                <span>Red Flags to Watch For</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
