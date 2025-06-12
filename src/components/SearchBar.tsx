
import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const SearchBar = () => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const searchSuggestions = [
    'Black Dress',
    'White Shirt',
    'Casual Blazer',
    'Slim Fit Jeans',
    'Cotton T-Shirt',
    'Leather Jacket',
    'Evening Gown',
    'Office Blazer'
  ];

  const filteredSuggestions = searchSuggestions.filter(item =>
    item.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="flex items-center">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search products..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setOpen(true)}
          className="w-64 pr-10"
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        
        {open && searchValue && (
          <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50">
            <Command>
              <CommandList>
                <CommandEmpty>No products found.</CommandEmpty>
                <CommandGroup>
                  {filteredSuggestions.map((suggestion) => (
                    <CommandItem
                      key={suggestion}
                      onSelect={() => {
                        setSearchValue(suggestion);
                        setOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      {suggestion}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        )}
      </div>
      
      {/* Click outside to close suggestions */}
      {open && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
};

export default SearchBar;
