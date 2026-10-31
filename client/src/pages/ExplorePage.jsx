import React, { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, RotateCcw, Sparkles, Inbox } from 'lucide-react';
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
        <div style={{ marginBottom: '2.25rem' }}>
          <div style={{ maxWidth: '680px', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-green">Resource Discovery</span>
              <span className="badge badge-gray">Campus Catalog</span>
            </div>
            <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
              Explore Campus Equipment & Spaces
            </h1>
            <p style={{ fontSize: '0.95rem', color: '#64748B' }}>
              Verified, high-value laboratory equipment, cinema gear, prototyping tools and research facilities available for academic sharing.
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
                  left: '1.15rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Search by equipment name, laboratory, model, or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  paddingLeft: '2.85rem',
                  fontSize: '0.95rem',
                  height: '50px',
                  borderRadius: 'var(--radius-lg)',
                }}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                padding: '0 1.75rem',
                height: '50px',
                borderRadius: 'var(--radius-lg)',
                fontSize: '0.95rem',
              }}
            >
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
            paddingBottom: '0.85rem',
            marginBottom: '1.5rem',
            scrollbarWidth: 'none',
          }}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat);
                  setPage(1);
                }}
                className={`badge ${isSelected ? 'badge-green' : 'badge-gray'}`}
                style={{
                  padding: '0.5rem 0.95rem',
                  fontSize: '0.825rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  border: isSelected ? '1px solid #16A34A' : '1px solid #E2E8F0',
                  backgroundColor: isSelected ? '#ECFDF5' : '#FFFFFF',
                  color: isSelected ? '#15803D' : '#475569',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  boxShadow: isSelected ? '0 1px 3px rgba(34, 197, 94, 0.2)' : 'none',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Secondary Filters Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            padding: '0.9rem 1.25rem',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '2rem',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>
              {totalCount} verified items
            </span>

            {/* Availability Toggle */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.825rem',
                cursor: 'pointer',
                color: '#475569',
                userSelect: 'none',
                fontWeight: 500,
              }}
            >
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => {
                  setAvailableOnly(e.target.checked);
                  setPage(1);
                }}
                style={{ accentColor: '#22C55E', width: '15px', height: '15px' }}
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
              style={{ width: 'auto', padding: '0.4rem 0.85rem', fontSize: '0.825rem' }}
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
              style={{ width: 'auto', padding: '0.4rem 0.85rem', fontSize: '0.825rem' }}
            >
              <option value="latest">Sort: Recently Added</option>
              <option value="popular">Sort: Most Reserved</option>
              <option value="rating">Sort: Highest Rating</option>
              <option value="name">Sort: Name (A-Z)</option>
            </select>

            <button
              onClick={handleResetFilters}
              className="btn btn-secondary btn-sm"
              title="Reset all filters"
              style={{ gap: '0.35rem' }}
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Resource Grid / Loading / Empty State */}
        {loading ? (
          <div className="resource-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="al-card"
                style={{ height: '370px', opacity: 0.6, backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}
              >
                <div style={{ width: '100%', height: '190px', backgroundColor: '#F1F5F9', borderRadius: '8px', marginBottom: '1rem' }} />
                <div style={{ width: '40%', height: '12px', backgroundColor: '#F1F5F9', borderRadius: '4px', marginBottom: '0.65rem' }} />
                <div style={{ width: '80%', height: '18px', backgroundColor: '#F1F5F9', borderRadius: '4px', marginBottom: '0.65rem' }} />
                <div style={{ width: '60%', height: '14px', backgroundColor: '#F1F5F9', borderRadius: '4px' }} />
              </div>
            ))}
          </div>
        ) : resources.length === 0 ? (
          <div
            className="al-card"
            style={{
              textAlign: 'center',
              padding: '4.5rem 2rem',
              backgroundColor: '#FFFFFF',
              borderStyle: 'dashed',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#ECFDF5',
                color: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <Search size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#0F172A' }}>
              No matching resources found
            </h3>
            <p style={{ maxWidth: '440px', margin: '0 auto 1.5rem', fontSize: '0.9rem', color: '#64748B' }}>
              We could not find any active resources matching your current search query or filter selection. Try clearing filters or exploring other categories.
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
              marginTop: '3.5rem',
            }}
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-secondary btn-sm"
            >
              Previous
            </button>
            <span style={{ fontSize: '0.85rem', color: '#475569', padding: '0 0.75rem', fontWeight: 600 }}>
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
