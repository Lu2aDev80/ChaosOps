import React from 'react';
import { useNavigate } from 'react-router-dom';
import { organisations } from '../../data/organisations';
import OrganisationCard from '../ui/OrganisationCard';
import styles from './OrganisationSelect.module.css';

interface OrganisationSelectProps {
  isLogin?: boolean;
}

const OrganisationSelect: React.FC<OrganisationSelectProps> = ({ isLogin = false }) => {
  const navigate = useNavigate();

  const handleOrganisationSelect = (orgId: string) => {
    // Store selected organisation in localStorage
    localStorage.setItem('selectedOrganisation', orgId);
    
    // Find the selected organisation for additional context
    const selectedOrg = organisations.find(org => org.id === orgId);
    if (selectedOrg) {
      localStorage.setItem('selectedOrganisationName', selectedOrg.name);
    }
    
    // Navigate to dashboard immediately
    const basePath = isLogin ? '/login' : '/admin';
    navigate(`${basePath}/dashboard`, { replace: true });
  };

  return (
    <div className={styles.selectContainer}>
      <div className={styles.selectHeader}>
        <h2 className={styles.selectTitle}>Organisation auswählen</h2>
        <p className={styles.selectSubtitle}>
          Wähle eine Organisation aus, um fortzufahren
        </p>
      </div>

      <div className={styles.organisationGrid}>
        {organisations.map((org) => (
          <OrganisationCard
            key={org.id}
            name={org.name}
            description={org.description}
            selected={false}
            onClick={() => handleOrganisationSelect(org.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default OrganisationSelect;
