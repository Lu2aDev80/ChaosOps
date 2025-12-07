
import React from "react";
import styles from "./HelpChat.module.css";

interface HelpChatProps {
  onClose?: () => void;
}

const HelpChat: React.FC<HelpChatProps> = ({ onClose }) => {
  return (
    <div className={styles.helpChatWidget}>
      <div className={styles.helpChatHeader}>
        <span>Help Chat</span>
        {onClose && (
          <button className={styles.closeBtn} onClick={onClose} aria-label="Schließen">×</button>
        )}
      </div>
      <div className={styles.helpChatBody}>
        <p>Coming Soon...</p>
      </div>
    </div>
  );
};

export default HelpChat;
