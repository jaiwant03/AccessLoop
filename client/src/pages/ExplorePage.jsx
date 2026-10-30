import React, { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, RotateCcw, Sparkles } from 'lucide-react';
import api from '../services/api';
import ResourceCard from '../components/ResourceCard';

const CATEGORIES = [
  'All',
  'Cameras',
  '3D Printers',
  'Laboratories',
  'Scientific Instruments',
  'Fabrication Tools',
  'Testing Devices',
  'Computers',
  'Laptops',
  'Audio Equipment',
  'Makerspaces',
  'Classrooms',
  'Specialised Technical Resources',
];

const ExplorePage = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [isPaid, setIsPaid] = useState('');
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Sync category from URL param if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('category');
    if (catParam) {
      setCategory(catParam);
    }
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 9,
        sort,
      };
      if (search.trim()) params.search = search.trim();
      if (category !== 'All') params.category = category;
      if (availableOnly) params.availableOnly = 'true';
      if (isPaid !== '') params.isPaid = isPaid;

      const res = await api.get('/resources', { params });
      setResources(res.data.resources || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(res.data.total || 0);
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [category, availableOnly, isPaid, sort, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchResources();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setAvailableOnly(false);
    setIsPaid('');
    setSort('latest');
    setPage(1);
  };

  return (
    <div className="main-content">
      <div className="app-container">
        {/* Page Title & Search Bar */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ maxWidth: '640px', marginBottom: '1.5rem' }}>
            <span className="badge badge-green" style={{ marginBottom: '0.45rem' }}>
              Resource Discovery
            </span>
            <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>
              Explore Campus Equipment & Spaces
            </h1>
            <p>
              Verified, high-value laboratory equipment, cinema gear, prototyping tools and research facilities.
            </p>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              display: 'flex',
              gap: '0.75rem',
              maxWidth: '720px',
            }}
          >
            <div style={{ position: 'relative', flex: 1 }}>
              <Search
                size={18}
                color="#64748B"
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Search by name, laboratory, equipment keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '2.75rem', fontSize: '0.95rem', height: '48px' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem', height: '48px' }}>
              Search
            </button>
          </form>
        </div>

        {/* Category Horizontal Filter Chips */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setPage(1);
              }}
              className={`badge ${
                category === cat ? 'badge-green' : 'badge-gray'
              }`}
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.825rem',
                cursor: 'pointer',
                border: category === cat ? '1px solid #16A34A' : '1px solid #CBD5E1',
                backgroundColor: category === cat ? '#F0FDF4' : '#FFFFFF',
                color: category === cat ? '#15803D' : '#475569',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Secondary Filters Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            padding: '1rem 1.25rem',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#17231C' }}>
              Showing {totalCount} verified items
            </span>

            {/* Availability Toggle */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.825rem',
                cursor: 'pointer',
                color: '#475569',
              }}
            >
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => {
                  setAvailableOnly(e.target.checked);
                  setPage(1);
                }}
              />
              <span>Available right now</span>
            </label>

            {/* Fee Filter */}
            <select
              value={isPaid}
              onChange={(e) => {
                setIsPaid(e.target.value);
                setPage(1);
              }}
              className="form-select"
              style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.825rem' }}
            >
              <option value="">All Pricing (Free & Paid)</option>
              <option value="false">Free to Share</option>
              <option value="true">Paid / Deposit Only</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Sort Selector */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.825rem' }}
            >
              <option value="latest">Sort by: Recently Added</option>
              <option value="popular">Sort by: Most Reserved</option>
              <option value="rating">Sort by: Highest Rating</option>
              <option value="name">Sort by: Name (A-Z)</option>
            </select>

            <button
              onClick={handleResetFilters}
              className="btn btn-secondary btn-sm"
              title="Reset all filters"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Resource Grid / Loading / Empty State */}
        {loading ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="al-card"
                style={{ height: '360px', opacity: 0.5, backgroundColor: '#F1F5F9' }}
              />
            ))}
          </div>
        ) : resources.length === 0 ? (
          <div
            className="al-card"
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              backgroundColor: '#FFFFFF',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#F0FDF4',
                color: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <Search size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              No matching resources found
            </h3>
            <p style={{ maxWidth: '440px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
              We could not find any active resources matching your current search query or filter selection.
            </p>
            <button onClick={handleResetFilters} className="btn btn-primary btn-sm">
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="resource-grid">
            {resources.map((resource) => (
              <ResourceCard key={resource._id} resource={resource} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '3rem',
            }}
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-secondary btn-sm"
            >
              Previous
            </button>
            <span style={{ fontSize: '0.85rem', color: '#475569', padding: '0 0.5rem' }}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn btn-secondary btn-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
