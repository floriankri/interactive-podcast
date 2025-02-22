
import { Search } from "lucide-react";
import { Input } from "./ui/input";

export const SearchBar = () => {
  return (
    <div className="relative max-w-2xl w-full">
      <Input
        type="text"
        placeholder="Search for podcasts..."
        className="w-full pl-12 h-14 text-lg glass-morphism"
      />
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
    </div>
  );
};
