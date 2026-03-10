// Notification Context Placeholder
import { createContext, useContext } from 'react';

const NotificationContext = createContext({ notifications: [], addNotification: () => {}, removeNotification: () => {} });

export const NotificationProvider = ({ children }) => {
  return <NotificationContext.Provider value={{ notifications: [], addNotification: () => {}, removeNotification: () => {} }}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => useContext(NotificationContext);
export default NotificationContext;
