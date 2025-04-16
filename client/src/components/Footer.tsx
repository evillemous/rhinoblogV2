import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-reddit-darkCard border-t border-gray-200 dark:border-gray-800 mt-8">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Link href="/" className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-reddit-orange flex items-center justify-center mr-2">
                <i className="fas fa-nose text-white"></i>
              </div>
              <span className="font-ibm-plex font-bold">RhinoplastyBlogs</span>
            </Link>
          </div>
          <div className="flex flex-wrap justify-center space-x-4 text-sm">
            <Link href="#" className="text-gray-600 dark:text-gray-300 hover:text-reddit-orange dark:hover:text-reddit-orange">About</Link>
            <Link href="#" className="text-gray-600 dark:text-gray-300 hover:text-reddit-orange dark:hover:text-reddit-orange">Terms</Link>
            <Link href="#" className="text-gray-600 dark:text-gray-300 hover:text-reddit-orange dark:hover:text-reddit-orange">Privacy</Link>
            <Link href="#" className="text-gray-600 dark:text-gray-300 hover:text-reddit-orange dark:hover:text-reddit-orange">Content Policy</Link>
            <Link href="#" className="text-gray-600 dark:text-gray-300 hover:text-reddit-orange dark:hover:text-reddit-orange">Contact</Link>
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-reddit-orange dark:hover:text-reddit-orange">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-reddit-orange dark:hover:text-reddit-orange">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-reddit-orange dark:hover:text-reddit-orange">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
          © {new Date().getFullYear()} RhinoplastyBlogs. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
