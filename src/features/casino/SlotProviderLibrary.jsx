import React, { useMemo, useRef, useState } from "react";
import { searchIndex } from "../../data/catalogue";
import { getGameId, gameFilters } from "../../lib/gameEngine";
import GameCard from "./GameCard";
import GameSearch from "./GameSearch";
import EmptyState from "../../components/ui/EmptyState";
import { catalogueEmptyState, discoverGames, indexCatalogue } from "./catalogueDiscovery";
const collections = [...new Set(searchIndex.map(({ game }) => game.provider))];
const discoveryIndex = indexCatalogue(searchIndex.map(({ game }) => game));
const filters = [...gameFilters, "Recent"];

export default function SlotProviderLibrary({
  onPlay,
  favorites = [],
  isFavorite,
  onToggleFavorite,
  recentGames = [],
}) {
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("default");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(48);
  const [provider, setProvider] = useState("all");
  const heading = useRef(null);
  const results = useMemo(
    () =>
      discoverGames(discoveryIndex, {
        searchTerm,
        provider,
        category,
        activeFilter,
        favorites,
        recentGames,
        sort,
      }),
    [searchTerm, activeFilter, favorites, recentGames, category, sort, provider],
  );
  const lastPage = Math.max(0, Math.ceil(results.length / pageSize) - 1);
  const currentPage = Math.min(page, lastPage);
  const hasFilters = Boolean(
    query ||
    searchTerm ||
    activeFilter !== "All" ||
    category !== "all" ||
    provider !== "all" ||
    sort !== "default",
  );
  const emptyState = catalogueEmptyState(activeFilter, favorites, recentGames);
  function resetFilters() {
    setQuery("");
    setSearchTerm("");
    setActiveFilter("All");
    setCategory("all");
    setProvider("all");
    setSort("default");
    setPage(0);
  }
  function changePage(nextPage) {
    setPage(nextPage);
    heading.current?.focus();
  }
  return (
    <section id="providers" className="scroll-mt-24">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Find your next favorite</p>
          <h2 ref={heading} tabIndex={-1} className="scroll-mt-24">
            Explore the catalogue
          </h2>
        </div>
        <span className="catalogue-count">{searchIndex.length} slot themes</span>
      </div>
      <div className="surface mb-6 p-4 md:p-5">
        <GameSearch
          value={query}
          onValueChange={setQuery}
          onResult={(value) => {
            setSearchTerm(value.trim());
            setPage(0);
          }}
        />
        <div className="mt-4 flex flex-wrap gap-2" aria-label="Game filters">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              aria-pressed={filter === activeFilter}
              onClick={() => {
                setActiveFilter(filter);
                setPage(0);
              }}
              className={`filter-chip ${filter === activeFilter ? "filter-active" : ""}`}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="catalogue-controls">
          <label className="text-sm">
            Theme collection
            <select
              aria-label="Theme collection"
              className="ml-2 max-w-full rounded-xl bg-slate-800 p-2"
              value={provider}
              onChange={(event) => {
                setProvider(event.target.value);
                setPage(0);
              }}
            >
              <option value="all">All collections</option>
              {collections.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Game style
            <select
              aria-label="Game style"
              className="ml-2 rounded-xl bg-slate-800 p-2"
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setPage(0);
              }}
            >
              <option value="all">All styles</option>
              <option value="originals">Lucky Orbit Originals</option>
              <option value="classic">Classic matches</option>
              <option value="line">Left-to-right</option>
              <option value="scatter">Star scatter</option>
            </select>
          </label>
          <label className="text-sm">
            Sort
            <select
              aria-label="Sort games"
              className="ml-2 rounded-xl bg-slate-800 p-2"
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
                setPage(0);
              }}
            >
              <option value="default">Featured order</option>
              <option value="az">Title A–Z</option>
              <option value="za">Title Z–A</option>
            </select>
          </label>
          <label className="text-sm">
            Games per page
            <select
              aria-label="Games per page"
              className="ml-2 rounded-xl bg-slate-800 p-2"
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(0);
              }}
            >
              {[24, 48, 96].map((size) => (
                <option key={size} value={size}>
                  {size} games
                </option>
              ))}
            </select>
          </label>
          {hasFilters && (
            <button type="button" className="filter-chip" onClick={resetFilters}>
              Reset filters
            </button>
          )}
        </div>
        <p className="mt-4 text-sm text-slate-400" role="status">
          {results.length
            ? `Showing ${currentPage * pageSize + 1}–${Math.min((currentPage + 1) * pageSize, results.length)} of ${results.length} games`
            : "0 games found"}
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-400">
          Originals and provider-inspired themes use local simulated rules. Official provider games are not
          connected.
        </p>
      </div>
      {recentGames.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 text-sm text-slate-400">Recently played</h3>
          <div className="flex flex-wrap gap-2">
            {recentGames.map((game) => (
              <button
                type="button"
                className="filter-chip"
                key={getGameId(game)}
                onClick={() => onPlay(game)}
              >
                {game.title}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="lobby-game-grid">
        {results.slice(currentPage * pageSize, (currentPage + 1) * pageSize).map((game) => (
          <GameCard
            key={getGameId(game)}
            game={game}
            onPlay={onPlay}
            isFavorite={isFavorite?.(game)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
      {!results.length ? (
        <EmptyState
          {...emptyState}
          action={
            <button type="button" className="primary-button" onClick={resetFilters}>
              Show all games
            </button>
          }
        />
      ) : (
        <nav aria-label="Catalogue pages" className="mt-6 flex items-center justify-center gap-4">
          <button
            className="filter-chip"
            disabled={currentPage === 0}
            onClick={() => changePage(currentPage - 1)}
          >
            Previous
          </button>
          <span className="text-sm text-slate-400">
            Page {currentPage + 1} of {lastPage + 1}
          </span>
          <button
            className="filter-chip"
            disabled={currentPage >= lastPage}
            onClick={() => changePage(currentPage + 1)}
          >
            Next
          </button>
        </nav>
      )}
    </section>
  );
}
