import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tag, Topic } from "@shared/schema";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import TagList from "@/components/TagList";

const Sidebar = () => {
  const { isAuthenticated } = useAuth();
  const [showCreatePost, setShowCreatePost] = useState(false);
  
  // Fetch tags
  const { data: tags } = useQuery<Tag[]>({
    queryKey: ["/api/tags"],
    staleTime: 300000, // 5 minutes cache
  });
  
  const handleCreatePost = () => {
    if (isAuthenticated) {
      // Implement create post modal/form
      setShowCreatePost(true);
    } else {
      // Redirect to login
      window.location.href = "/login";
    }
  };
  
  return (
    <aside className="hidden lg:block w-64 flex-shrink-0 pr-6">
      <div className="bg-white dark:bg-reddit-darkCard rounded-md shadow mb-4 overflow-hidden">
        <div className="bg-reddit-orange p-4">
          <h2 className="text-white font-ibm-plex font-bold text-lg">About RhinoplastyBlogs</h2>
        </div>
        <div className="p-4">
          <p className="text-sm mb-4">A community for sharing rhinoplasty experiences, tips, and support for people at all stages of their journey.</p>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3">
            <i className="fas fa-birthday-cake mr-2"></i>
            <span>Created Jan 2023</span>
          </div>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3">
            <i className="fas fa-users mr-2"></i>
            <span>14.2k members</span>
          </div>
          <hr className="my-3 border-gray-200 dark:border-gray-700" />
          <Button 
            className="w-full bg-reddit-orange text-white hover:bg-orange-600 font-medium py-1.5 rounded-full mb-3"
            onClick={handleCreatePost}
          >
            Create Post
          </Button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-reddit-darkCard rounded-md shadow mb-4">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-ibm-plex font-bold">Popular Tags</h2>
        </div>
        <div className="p-4">
          <TagList tags={tags || []} />
        </div>
      </div>
      
      <div className="bg-white dark:bg-reddit-darkCard rounded-md shadow">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-ibm-plex font-bold">Community Rules</h2>
        </div>
        <div className="p-4">
          <div className="space-y-3 text-sm">
            <div className="flex">
              <span className="font-medium mr-2">1.</span>
              <p>Be respectful and supportive</p>
            </div>
            <div className="flex">
              <span className="font-medium mr-2">2.</span>
              <p>No medical advice (consult professionals)</p>
            </div>
            <div className="flex">
              <span className="font-medium mr-2">3.</span>
              <p>Mark graphic content as NSFW</p>
            </div>
            <div className="flex">
              <span className="font-medium mr-2">4.</span>
              <p>No surgeon bashing or promotion</p>
            </div>
            <div className="flex">
              <span className="font-medium mr-2">5.</span>
              <p>Tag your posts appropriately</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
