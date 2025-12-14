// server/app/routers/export.router.js

module.exports = function(router) {
    const exportController = require('../controllers/export.controller');

    // Định nghĩa API: GET /api/export/csv
    router.get("/api/export/csv", exportController.exportToCSV);
};