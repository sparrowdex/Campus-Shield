const request = require('supertest');
const { app } = require('../app'); // Import the configured express app
const memoryStore = require('../services/memoryStoreSingleton');
const Report = require('../models/Report');

// Mock the middleware directly
jest.mock('../middleware/auth', () => jest.fn((req, res, next) => {
  // Simulate a logged-in admin user
  req.user = { userId: 'mock-admin-id', role: 'admin' };
  next();
}));

// This mock is for the admin role check middleware
jest.mock('../middleware/admin', () => jest.fn((req, res, next) => next()));

// Mock the singleton service and models
jest.mock('../services/memoryStoreSingleton');
jest.mock('../models/Report');


describe('Admin Routes Integration Tests', () => {

  beforeEach(() => {
    // Reset mocks before each test to ensure isolation
    memoryStore.getStats.mockClear();
    memoryStore.getAllReports.mockClear();
    Report.findById.mockClear();
  });

  describe('GET /api/admin/stats', () => {
    it('should successfully fetch stats and return a 200 status', async () => {
      // Define the mock data that our memoryStore will return for this test
      const mockStats = {
        totalUsers: 25,
        totalReports: 10,
        pendingReports: 4,
        resolvedReports: 6,
        resolutionRate: '60.0',
        pendingAdminRequests: 1,
      };
       // Only one report was created in the last 24 hours
      const mockReports = [
        { createdAt: new Date().toISOString() },
        { createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() } // 2 days ago
      ];
      
      // Configure our mocks to return the defined data
      memoryStore.getStats.mockReturnValue(mockStats);
      memoryStore.getAllReports.mockReturnValue(mockReports);

      // Use supertest to send a request to our app
      const response = await request(app).get('/api/admin/stats');

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.stats).toBeDefined();
      expect(response.body.stats.totalUsers).toBe(25);
      expect(response.body.stats.totalReports).toBe(10);
      // The controller calculates recent reports, so we test that calculation
      expect(response.body.stats.recentReports).toBe(1); 
    });

    it('should return 500 if there is a server error', async () => {
        // Force an error in the mock
        memoryStore.getStats.mockImplementation(() => {
            throw new Error('Test DB Error');
        });

        const response = await request(app).get('/api/admin/stats');
        
        expect(response.status).toBe(500);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Server error');
    });
  });

  describe('POST /api/admin/reports/:id/note', () => {
    it('should add a note to a report and return 200', async () => {
      const reportId = 'mock-report-id';
      const noteText = 'This is a test note.';
      const mockAdminId = 'mock-admin-id';

      // Mock the report instance and its method
      const mockReportInstance = {
        addAdminNote: jest.fn().mockResolvedValue(true),
      };
      Report.findById.mockResolvedValue(mockReportInstance);

      const response = await request(app)
        .post(`/api/admin/reports/${reportId}/note`)
        .send({ note: noteText });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Admin note added successfully');

      // Verify that the correct functions were called
      expect(Report.findById).toHaveBeenCalledWith(reportId);
      expect(mockReportInstance.addAdminNote).toHaveBeenCalledWith(noteText, mockAdminId);
    });

    it('should return 404 if the report is not found', async () => {
      const reportId = 'non-existent-id';
      Report.findById.mockResolvedValue(null); // Simulate report not found

      const response = await request(app)
        .post(`/api/admin/reports/${reportId}/note`)
        .send({ note: 'A note for a ghost report' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Report not found');
    });
  });
});
