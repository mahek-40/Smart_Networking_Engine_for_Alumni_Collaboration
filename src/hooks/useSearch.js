import { useState, useEffect, useMemo } from 'react';

const useSearch = (data = [], searchKeys = [], filters = {}) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const results = useMemo(() => {
    let filtered = [...data];
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase();
      filtered = filtered.filter(item =>
        searchKeys.some(key => {
          const val = key.split('.').reduce((o, k) => o?.[k], item);
          if (Array.isArray(val)) return val.some(v => String(v).toLowerCase().includes(q));
          return String(val || '').toLowerCase().includes(q);
        })
      );
    }
    Object.entries(filters).forEach(([key, value]) => {
      if (!value || value === 'all') return;
      filtered = filtered.filter(item => {
        const itemVal = item[key];
        if (Array.isArray(itemVal)) return itemVal.some(v => String(v).toLowerCase().includes(String(value).toLowerCase()));
        return String(itemVal || '').toLowerCase().includes(String(value).toLowerCase());
      });
    });
    return filtered;
  }, [data, debouncedQuery, filters]);

  return { query, setQuery, results, count: results.length };
};

export default useSearch;
