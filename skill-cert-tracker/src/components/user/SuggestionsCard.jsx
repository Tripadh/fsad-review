import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { request } from '../../utils/apiClient';
import '../../styles/suggestions.css';

export default function SuggestionsCard() {
  const { currentUser } = useAuth();
  const { certifications } = useData();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const fetchSuggestions = useCallback(async ({ showLoader = false } = {}) => {
    if (!currentUser?.id) {
      setSuggestions([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setFetchError('');
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      const data = await request(`/certifications/suggestions/${currentUser.id}`);
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setFetchError(error?.message || 'Unable to load suggestions right now.');
      setSuggestions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    fetchSuggestions({ showLoader: true });
  }, [fetchSuggestions, currentUser?.id]);

  useEffect(() => {
    if (!currentUser?.id) return;
    fetchSuggestions();
  }, [fetchSuggestions, certifications, currentUser?.id]);

  const getPriorityBg = (priority) => {
    switch (priority) {
      case 'urgent': return '#ff4444';
      case 'high': return '#ff9800';
      case 'medium': return '#2196f3';
      case 'low': return '#4caf50';
      default: return '#666';
    }
  };

  const handleAction = (suggestion) => {
    if (suggestion.type === 'no_certs') {
      window.location.href = '/dashboard?tab=certs';
    } else {
      setExpandedId(expandedId === suggestion.id ? null : suggestion.id);
    }
  };

  if (loading) {
    return (
      <div className="suggestions-card">
        <div className="suggestions-card__title">💡 Smart Suggestions</div>
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading suggestions...
        </div>
      </div>
    );
  }

  // Sort by priority
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  const sorted = [...suggestions].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  return (
    <div className="suggestions-card">
      <div className="suggestions-card__header">
        <div className="suggestions-card__title">💡 Smart Suggestions</div>
        <div className="suggestions-card__controls">
          <button
            type="button"
            className="suggestions-card__refresh"
            onClick={() => fetchSuggestions()}
            disabled={refreshing || loading}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <div className="suggestions-card__badge">{suggestions.length} action{suggestions.length !== 1 ? 's' : ''}</div>
        </div>
      </div>

      <div className="suggestions-list">
        {sorted.map((suggestion, idx) => (
          <div
            key={idx}
            className={`suggestion-item suggestion-item--${suggestion.priority}`}
            style={{ borderLeftColor: getPriorityBg(suggestion.priority) }}
          >
            <div className="suggestion-item__header" onClick={() => handleAction(suggestion)}>
              <div className="suggestion-item__title">
                {suggestion.title}
              </div>
              <div className="suggestion-item__badge" style={{ backgroundColor: getPriorityBg(suggestion.priority) }}>
                {suggestion.priority}
              </div>
            </div>

            {expandedId === suggestion.id && (
              <div className="suggestion-item__details">
                <p className="suggestion-item__description">{suggestion.description}</p>
                
                {suggestion.certTitle && (
                  <div className="suggestion-item__cert-info">
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <strong>Certificate:</strong> {suggestion.certTitle}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <strong>Issuer:</strong> {suggestion.issuer}
                    </div>
                    {suggestion.expiryDate && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <strong>Expires:</strong> {new Date(suggestion.expiryDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )}

                <button className="suggestion-item__action-btn">
                  {suggestion.action}
                </button>
              </div>
            )}

            {expandedId !== suggestion.id && (
              <div className="suggestion-item__action">{suggestion.action} →</div>
            )}
          </div>
        ))}

        {!sorted.length && (
          <div className="suggestion-item suggestion-item--medium" style={{ cursor: 'default' }}>
            <div className="suggestion-item__title">
              {fetchError ? 'Could not load smart suggestions' : 'No suggestions yet'}
            </div>
            <div className="suggestion-item__details" style={{ display: 'block' }}>
              <p className="suggestion-item__description">
                {fetchError
                  ? `${fetchError} Click refresh to try again.`
                  : 'Upload your first certification with an expiry date to get upcoming renewal suggestions.'}
              </p>
              <button
                type="button"
                className="suggestion-item__action-btn"
                onClick={() => fetchSuggestions()}
                disabled={refreshing || loading}
              >
                {refreshing ? 'Refreshing...' : 'Refresh Suggestions'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
