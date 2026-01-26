import React from 'react';
import { Clock, FileText, Package, AlertCircle } from 'lucide-react';
import type { ScheduleItem } from '../../types/schedule';

interface HelperInfoStickyProps {
  item: ScheduleItem;
  /** 'display' for screens, 'shared' for shared/QR links */
  viewType: 'display' | 'shared' | 'preview';
}

/**
 * Red sticky note that displays helper/employee information.
 * Only shows when the item has helper info and it's enabled for the view type.
 */
const HelperInfoSticky: React.FC<HelperInfoStickyProps> = ({ item, viewType }) => {
  // Check if helper info should be shown for this view type
  const hasHelperInfo = item.helperMeetingTime || item.helperNotes || item.helperMaterials;
  
  if (!hasHelperInfo) return null;

  // For display views, only show if explicitly enabled
  // For shared/preview views, show if enabled (default true)
  const shouldShow = viewType === 'display' 
    ? item.showHelperInfoOnDisplay === true
    : viewType === 'shared'
      ? item.showHelperInfoOnSharedPlan !== false // default true
      : true; // preview always shows

  if (!shouldShow) return null;

  return (
    <div
      style={{
        position: 'relative',
        marginTop: '0.5rem',
        marginBottom: '0.25rem',
        padding: '0.75rem 1rem',
        background: 'linear-gradient(135deg, #fecaca 0%, #fca5a5 50%, #f87171 100%)',
        borderRadius: '4px 4px 12px 4px',
        border: '2px solid #b91c1c',
        boxShadow: '3px 3px 0 rgba(185, 28, 28, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1)',
        transform: 'rotate(-0.5deg)',
        fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
      }}
      aria-label="Helfer-Informationen"
    >
      {/* Tape effect on top */}
      <div
        style={{
          position: 'absolute',
          top: '-8px',
          left: '50%',
          transform: 'translateX(-50%) rotate(2deg)',
          width: '60px',
          height: '18px',
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.7), rgba(255,255,255,0.3))',
          borderRadius: '2px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        }}
        aria-hidden="true"
      />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.5rem',
          color: '#7f1d1d',
          fontWeight: 700,
          fontSize: '0.9rem',
        }}
      >
        <AlertCircle size={16} />
        <span>Team-Info</span>
      </div>

      {/* Helper Meeting Time */}
      {item.helperMeetingTime && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.35rem',
            color: '#991b1b',
            fontSize: '0.85rem',
          }}
        >
          <Clock size={14} />
          <span>
            <strong>Team-Treff:</strong> {item.helperMeetingTime}
          </span>
        </div>
      )}

      {/* Helper Notes */}
      {item.helperNotes && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            marginBottom: '0.35rem',
            color: '#991b1b',
            fontSize: '0.85rem',
          }}
        >
          <FileText size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
          <span>
            <strong>Hinweise:</strong> {item.helperNotes}
          </span>
        </div>
      )}

      {/* Helper Materials */}
      {item.helperMaterials && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            color: '#991b1b',
            fontSize: '0.85rem',
          }}
        >
          <Package size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
          <span>
            <strong>Material:</strong> {item.helperMaterials}
          </span>
        </div>
      )}
    </div>
  );
};

export default HelperInfoSticky;
