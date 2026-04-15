const { db } = require('../config/firebase');
const { getIO } = require('../config/socket');

// @desc    Create a new request
// @route   POST /api/requests
// @access  Public (Should be Client)
const createRequest = async (req, res, next) => {
  try {
    const { senderId, senderName, task, location } = req.body;

    if (!senderId || !task || !location) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newRequest = {
      senderId,
      senderName: senderName || 'Anonymous',
      task,
      location,
      status: 'pending', // pending, accepted, completed
      helperId: null,
      helperName: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection('requests').add(newRequest);
    const savedRequest = { id: docRef.id, ...newRequest };

    // Real-time: Notify all helpers about new request
    const io = getIO();
    io.to('helpers').emit('newRequest', savedRequest);

    res.status(201).json(savedRequest);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all requests (with filters)
// @route   GET /api/requests
const getRequests = async (req, res, next) => {
  try {
    const { userId, role, status } = req.query;
    let query = db.collection('requests');

    if (role === 'client' && userId) {
      query = query.where('senderId', '==', userId);
    } else if (role === 'helper' && status === 'completed' && userId) {
      query = query.where('helperId', '==', userId).where('status', '==', 'completed');
    } else if (role === 'helper' && status === 'pending') {
      query = query.where('status', '==', 'pending');
    } else if (role === 'helper' && status === 'accepted' && userId) {
        query = query.where('helperId', '==', userId).where('status', '==', 'accepted');
    }

    const snapshot = await query.get();
    const requests = [];
    snapshot.forEach(doc => {
      requests.push({ id: doc.id, ...doc.data() });
    });

    // Sort in-memory to avoid missing composite index errors
    requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.status(200).json(requests);
  } catch (error) {
    next(error);
  }
};

// @desc    Accept a request
// @route   PATCH /api/requests/:id/accept
const acceptRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { helperId, helperName } = req.body;

    const requestRef = db.collection('requests').doc(id);
    const doc = await requestRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (doc.data().status !== 'pending') {
      return res.status(400).json({ message: 'Request already accepted or completed' });
    }

    await requestRef.update({
      status: 'accepted',
      helperId,
      helperName,
      updatedAt: new Date().toISOString()
    });

    const updatedData = { id, status: 'accepted', helperId, helperName };
    
    // Real-time: Notify the client and all helpers
    const io = getIO();
    io.to(`user_${doc.data().senderId}`).emit('requestUpdated', updatedData);
    io.to('helpers').emit('requestUpdated', updatedData);

    res.status(200).json(updatedData);
  } catch (error) {
    next(error);
  }
};

// @desc    Complete a request
// @route   PATCH /api/requests/:id/complete
const completeRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const requestRef = db.collection('requests').doc(id);
    const doc = await requestRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Request not found' });
    }

    await requestRef.update({
      status: 'completed',
      updatedAt: new Date().toISOString()
    });

    const updatedData = { id, status: 'completed' };
    
    // Real-time: Notify the client and all helpers
    const io = getIO();
    io.to(`user_${doc.data().senderId}`).emit('requestUpdated', updatedData);
    io.to('helpers').emit('requestUpdated', updatedData);

    res.status(200).json(updatedData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  getRequests,
  acceptRequest,
  completeRequest
};
