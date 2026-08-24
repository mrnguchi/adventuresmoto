"use client";

import { useMemo, useState } from "react";

import { BrandLogoCard } from "@/components/brand-logo-card";
import { CloseIcon, SearchIcon } from "@/components/icons";
import { brandGroups, brands } from "@/data/brands";

const ALL_BRANDS = "ALL";

export function BrandDirectory() {
  const [selectedInitial, setSelectedInitial] = useState(ALL_BRANDS);
  const [searchQuery, setSearchQuery] = useState("");

  const visibleGroups = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return brandGroups
      .filter(
        (group) =>
          selectedInitial === ALL_BRANDS ||
          group.initial === selectedInitial,
      )
      .map((group) => ({
        ...group,
        brands: group.brands.filter((brand) =>
          brand.name.toLowerCase().includes(normalizedQuery),
        ),
      }))
      .filter((group) => group.brands.length > 0);
  }, [searchQuery, selectedInitial]);

  const visibleBrandCount = visibleGroups.reduce(
    (total, group) => total + group.brands.length,
    0,
  );

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedInitial(ALL_BRANDS);
  };

  return (
    <section className="brand-directory" aria-labelledby="brands-title">
      <header className="brand-directory-heading">
        <div>
          <p>Find your favourites</p>
          <h1 id="brands-title">Brands</h1>
        </div>
        <span>{brands.length} brands and counting</span>
      </header>

      <div className="brand-finder">
        <div className="brand-search">
          <SearchIcon aria-hidden="true" />
          <label className="sr-only" htmlFor="brand-search">
            Search brands
          </label>
          <input
            id="brand-search"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by brand name"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear brand search"
            >
              <CloseIcon aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <div className="brand-initial-filter" aria-label="Filter brands by name">
          <button
            className={selectedInitial === ALL_BRANDS ? "is-active" : ""}
            type="button"
            onClick={() => setSelectedInitial(ALL_BRANDS)}
            aria-pressed={selectedInitial === ALL_BRANDS}
          >
            All
          </button>
          {brandGroups.map((group) => (
            <button
              className={selectedInitial === group.initial ? "is-active" : ""}
              type="button"
              key={group.initial}
              onClick={() => setSelectedInitial(group.initial)}
              aria-pressed={selectedInitial === group.initial}
              aria-label={`Show brands beginning with ${group.initial}`}
            >
              {group.initial}
            </button>
          ))}
        </div>
      </div>

      <div className="brand-results-summary" aria-live="polite">
        <p>
          Showing <strong>{visibleBrandCount}</strong>{" "}
          {visibleBrandCount === 1 ? "brand" : "brands"}
        </p>
        {searchQuery || selectedInitial !== ALL_BRANDS ? (
          <button type="button" onClick={clearFilters}>
            Clear filters
          </button>
        ) : null}
      </div>

      {visibleGroups.length > 0 ? (
        <div className="brand-results">
          {visibleGroups.map((group) => (
            <section
              className="brand-initial-group"
              key={group.initial}
              aria-labelledby={`brand-group-${group.initial}`}
            >
              <h2 id={`brand-group-${group.initial}`}>{group.initial}</h2>
              <div className="brands-directory-grid">
                {group.brands.map((brand) => (
                  <BrandLogoCard key={brand.name} brand={brand} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="brand-empty-state">
          <h2>No brands found</h2>
          <p>Try another spelling or clear your current filters.</p>
          <button type="button" onClick={clearFilters}>
            Show all brands
          </button>
        </div>
      )}
    </section>
  );
}
