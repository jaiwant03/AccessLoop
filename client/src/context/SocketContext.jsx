import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [liveNotification, setLiveNotification] = useState(null);
  const [bookingUpdate, setBookingUpdate] = useState(null);

  useEffect(() => {
    const currentUserId = user?._id || user?.id;
    if (user && currentUserId) {
      // Connect to root backend
      const socketUrl = window.location.origin.includes(':5173')
        ? 'http://localhost:5000'
        : window.location.origin;

      const newSocket = io(socketUrl, {
        transports: ['websocket', 'polling'],
      });

      newSocket.on('connect', () => {
        newSocket.emit('join_user_room', currentUserId);
      });

      newSocket.on('new_notification', (notif) => {
        setLiveNotification(notif);
      });

      newSocket.on('booking_status_updated', (booking) => {
        setBookingUpdate(booking);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [user?._id, user?.id]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        liveNotification,
        bookingUpdate,
        clearLiveNotification: () => setLiveNotification(null),
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
