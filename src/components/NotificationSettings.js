import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config';
import {
  NotificationContainer,
  NotificationToggle,
  NotificationSwitch,
  NotificationSlider,
  NotificationKnob,
  NotificationTitle,
  NotificationRow,
  NotificationInfo,
  NotificationLabel,
  NotificationDescription,
  NotificationMessage,
} from '../styles/NotificationSettings.styles';

const NotificationSettings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const user = await res.json();
        setEmailNotifications(user.email_notifications_enabled || true);
      } catch (err) {
        console.error('שגיאה בטעינת הגדרות:', err);
      }
    };

    fetchSettings();
  }, []);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const newValue = !emailNotifications;
      
      const res = await fetch(`${API_BASE_URL}/users/notifications`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ enabled: newValue })
      });

      if (res.ok) {
        setEmailNotifications(newValue);
        setMessage(newValue ? 
          '✅ התראות מייל הופעלו בהצלחה!' : 
          '❌ התראות מייל הושבתו'
        );
      }
    } catch (err) {
      setMessage('❌ שגיאה בעדכון ההגדרות');
      console.error('שגיאה:', err);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <NotificationContainer>
      <NotificationTitle>
        📧 הגדרות התראות
      </NotificationTitle>
      
      <NotificationToggle>
        <NotificationInfo>
          <NotificationLabel>
            התראות בדואר אלקטרוני
          </NotificationLabel>
          <NotificationDescription>
            קבל התראות על הודעות חדשות ועסקאות במייל
          </NotificationDescription>
        </NotificationInfo>
        
        <NotificationSwitch>
          <input
            type="checkbox"
            checked={emailNotifications}
            onChange={handleToggle}
            disabled={loading}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <NotificationSlider $isEnabled={emailNotifications} onClick={handleToggle}>
            <NotificationKnob $isEnabled={emailNotifications} />
          </NotificationSlider>
        </NotificationSwitch>
      </NotificationToggle>

      {message && (
        <NotificationMessage $isSuccess={message.includes('✅')}>
          {message}
        </NotificationMessage>
      )}
    </NotificationContainer>
  );
};

export default NotificationSettings;