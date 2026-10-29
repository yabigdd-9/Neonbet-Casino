import React, { useMemo, useRef, useState } from "react";
import { searchIndex } from "../../data/catalogue";
import { getGameId, gameFilters } from "../../lib/gameEngine";
import GameCard from "./GameCard";
import GameSearch from "./GameSearch";
import EmptyState from "../../components/ui/EmptyState";

export default function SlotProviderLibrary({
  onPlay,
  favorites,
  isFavorite,
  onToggleFavorite,
  recentGames,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("default");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(48);
  const heading = useRef(null);
  const results = useMemo(
    () =>
      searchIndex
        .filter(
          ({ game, text }) =>
            (!searchTerm || text.includes(searchTerm.toLowerCase())) &&
            (category === "all" ||
              (category === "originals"
                ? game.provider === "Lucky Orbit Originals"
                : (game.mechanic || "classic") === category)) &&
            (activeFilter === "All" ||
              (activeFilter === "Favorites"
                ? favorites.includes(getGameId(game))
                : game.tags.includes(activeFilter))),
        )
        .map((row) => row.game)
        .sort((a, b) =>
          sort === "az" ? a.title.localeCompare(b.title) : sort === "za" ? b.title.localeCompare(a.title) : 0,
        ),
    [searchTerm, activeFilter, favorites, category, sort],
  );
  const lastPage = Math.max(0, Math.ceil(results.length / pageSize) - 1);
  const currentPage = Math.min(page, lastPage);
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
        <span className="catalogue-count">{searchIndex.length} practice slot themes</span>
      </div>
      <div className="surface mb-6 p-4 md:p-5">
        <GameSearch
          onResult={(value) => {
            setSearchTerm(value.trim());
            setPage(0);
          }}
        />
        <div className="mt-4 flex flex-wrap gap-2" aria-label="Game filters">
          {gameFilters.map((filter) => (
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
        </div>
        <p className="mt-4 text-sm text-slate-400" role="status">
          {results.length
            ? `Showing ${currentPage * pageSize + 1}–${Math.min((currentPage + 1) * pageSize, results.length)} of ${results.length} games`
            : "0 games found"}
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-400">
          Originals and provider-inspired themes use local practice rules. Official provider games are not
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
            isFavorite={isFavorite(game)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
      {!results.length ? (
        <EmptyState title="No matching games" description="Try a different search or choose All." />
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
