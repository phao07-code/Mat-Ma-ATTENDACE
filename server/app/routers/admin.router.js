// /Server/app/routers/admin.router.js

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

// POST /api/login
router.post('/login', adminController.loginAdmin); 

// GET /api/check-auth
router.get('/check-auth', adminController.checkAuth); 

// POST /api/logout
router.post('/logout', adminController.logoutAdmin);

module.exports = router;