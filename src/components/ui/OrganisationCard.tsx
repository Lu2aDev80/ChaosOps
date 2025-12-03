import React from 'react';
import styles from './OrganisationCard.module.css';

interface OrganisationCardProps {
  name: string;
  description?: string;
  logoUrl?: string;
  selected?: boolean;
  onClick: () => void;
}

const OrganisationCard: React.FC<OrganisationCardProps> = ({ name, description, logoUrl, selected, onClick }) => {
  // Get API base URL and construct full logo URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/minihackathon';
  const fullLogoUrl = logoUrl && logoUrl.startsWith('http') ? logoUrl : logoUrl ? `${API_BASE_URL}${logoUrl}` : undefined;
  
  return (
    <button
      className={selected ? `${styles.organisationCard} ${styles.selected}` : styles.organisationCard}
      onClick={onClick}
      aria-pressed={selected}
      tabIndex={0}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: fullLogoUrl ? '0.5rem' : '0' }}>
        {fullLogoUrl && (
          <img
            src={fullLogoUrl}
            alt={`${name} Logo`}
            style={{
              width: '32px',
              height: '32px',
              objectFit: 'contain',
              borderRadius: '4px',
              flexShrink: 0
            }}
            onError={(e) => {
              // Hide image if it fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        <div style={{ fontWeight: '700' }}>{name}</div>
      </div>
      {description && <div className={styles.description}>{description}</div>}
    </button>
  );
};

export default OrganisationCard;
