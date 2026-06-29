import React from 'react';
import GlobalSearch from './GlobalSearch.jsx';
import QuestionCounter from './QuestionCounter.jsx';

const Toolbar = React.memo(({
  total,
  isFiltered = false,
  filterSummary = [],
  searchValue,
  onSearchChange,
  searchLoading = false,
  recentSearches = [],
}) => {
  const visibleSummary = filterSummary.filter(Boolean);

  return (
    <div className="flex w-full items-center mb-5">
      <div className="flex w-full min-w-0 justify-center">
        <GlobalSearch
          value={searchValue}
          onChange={onSearchChange}
          isLoading={searchLoading}
          recentSearches={recentSearches}
        />
      </div>
    </div>
  );
});

Toolbar.displayName = 'Toolbar';

export default Toolbar;
