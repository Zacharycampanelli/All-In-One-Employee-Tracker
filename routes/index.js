const router = require('express').Router();
const employeeRoutes = require('./employee-routes');

router.use(employeeRoutes);

module.exports = router; 