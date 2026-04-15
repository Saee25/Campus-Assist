const express = require('express');
const router = express.Router();
const { 
  createRequest, 
  getRequests, 
  acceptRequest, 
  completeRequest 
} = require('../controllers/requestController');

router.post('/', createRequest);
router.get('/', getRequests);
router.patch('/:id/accept', acceptRequest);
router.patch('/:id/complete', completeRequest);

module.exports = router;
