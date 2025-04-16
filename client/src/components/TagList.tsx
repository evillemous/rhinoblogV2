import { Link } from "wouter";
import { Tag } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

interface TagListProps {
  tags: Tag[];
}

const TagList = ({ tags }: TagListProps) => {
  const getTagColorClasses = (color: string | undefined) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
      green: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
      purple: "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200",
      yellow: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
      red: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
      indigo: "bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200",
      pink: "bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200",
      gray: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
      orange: "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200"
    };
    
    return colorMap[color || "gray"] || colorMap.gray;
  };
  
  if (!tags.length) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        No tags available
      </div>
    );
  }
  
  return (
    <div className="flex flex-wrap">
      {tags.map((tag) => (
        <Link key={tag.id} href={`/tag/${tag.name}`}>
          <Badge
            variant="outline"
            className={`inline-block ${getTagColorClasses(tag.color)} text-xs px-2 py-1 rounded-full mb-2 mr-2 cursor-pointer`}
          >
            #{tag.name}
          </Badge>
        </Link>
      ))}
    </div>
  );
};

export default TagList;
