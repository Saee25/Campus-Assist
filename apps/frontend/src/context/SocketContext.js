'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

const NOTIFICATION_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io();
      setSocket(newSocket);

      // Join rooms on connect
      newSocket.on('connect', () => {
        console.log('Connected to socket server');
        
        // Join general helper room if applicable
        if (user.role === 'helper') {
          newSocket.emit('join', 'helpers');
        }
        
        // Join specific user room for direct updates
        newSocket.emit('join', `user_${user.id}`);
      });

      const playSound = () => {
        new Audio(NOTIFICATION_SOUND).play().catch(e => console.log('Audio error:', e));
      };

      newSocket.on('newRequest', (data) => {
        if (user.role === 'helper') {
          playSound();
          toast.success(`New Task: ${data.task} at ${data.location}`, { icon: '📦' });
        }
      });

      newSocket.on('requestUpdated', (data) => {
        playSound();
        const statusText = data.status === 'accepted' ? 'is now being served' : 'has been completed';
        toast(`Task "${data.task || 'Your request'}" ${statusText}`, { icon: '📢' });
      });

      return () => {
        newSocket.off('newRequest');
        newSocket.off('requestUpdated');
        newSocket.close();
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
