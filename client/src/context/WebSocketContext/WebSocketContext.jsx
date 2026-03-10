// WebSocket Context Placeholder
import { createContext, useContext } from 'react';

const WebSocketContext = createContext({ connected: false, send: () => {} });

export const WebSocketProvider = ({ children }) => {
  return <WebSocketContext.Provider value={{ connected: false, send: () => {} }}>{children}</WebSocketContext.Provider>;
};

export const useWebSocket = () => useContext(WebSocketContext);
export default WebSocketContext;
