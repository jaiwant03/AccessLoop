let ioInstance = null;

const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    socket.on('join_user_room', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });
};

const sendRealtimeNotification = (userId, notification) => {
  if (ioInstance && userId) {
    ioInstance.to(`user_${userId}`).emit('new_notification', notification);
  }
};

const sendBookingUpdate = (userId, booking) => {
  if (ioInstance && userId) {
    ioInstance.to(`user_${userId}`).emit('booking_status_updated', booking);
  }
};

module.exports = {
  initSocket,
  sendRealtimeNotification,
  sendBookingUpdate,
  getIO: () => ioInstance,
};
