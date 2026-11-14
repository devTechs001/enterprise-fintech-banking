import { createContext, useCallback, useContext, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { securityService } from '@/services/api/securityService';
import { selectIsAuthenticated } from '@/store/slices/authSlice';

const NotificationContext = createContext(null);

const NOTIFICATION_QUERY_KEY = ['notifications'];

/**
 * Notification provider backed by the API.
 *
 * Replaces the previous placeholder, which rendered an empty array forever and
 * silently discarded every `addNotification` call.
 */
export const NotificationProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: NOTIFICATION_QUERY_KEY,
    queryFn: async () => {
      const response = await securityService.getNotifications();
      return response.data;
    },
    // Do not poll a protected endpoint before the session bootstrap finishes,
    // otherwise every page load fires a 401 and a pointless refresh.
    enabled: isAuthenticated,
    refetchInterval: 60000,
    retry: 1,
  });

  const markRead = useMutation({
    mutationFn: (id) => securityService.markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEY }),
  });

  const markAllRead = useMutation({
    mutationFn: () => securityService.markAllNotificationsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEY }),
  });

  const notifications = useMemo(() => data?.notifications ?? [], [data]);
  const unreadCount = useMemo(
    () => (typeof data?.unreadCount === 'number'
      ? data.unreadCount
      : notifications.filter((n) => !n.read).length),
    [data, notifications]
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      isError,
      refresh: refetch,
      markAsRead: (id) => markRead.mutateAsync(id),
      markAllAsRead: () => markAllRead.mutateAsync(),
    }),
    [notifications, unreadCount, isLoading, isError, refetch, markRead, markAllRead]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    // Degrade instead of throwing so a stray hook usage cannot white-screen the app.
    return {
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      isError: false,
      refresh: useCallback(() => {}, []),
      markAsRead: useCallback(async () => {}, []),
      markAllAsRead: useCallback(async () => {}, []),
    };
  }
  return context;
};

export default NotificationContext;
