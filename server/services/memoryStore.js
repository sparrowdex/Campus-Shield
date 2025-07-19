// In-memory data store for testing when MongoDB is not available
class MemoryStore {
  constructor() {
    this.users = new Map();
    this.reports = new Map();
    this.chatRooms = new Map();
    this.messages = new Map();
    this.adminRequests = new Map();
    this.nextUserId = 1;
    this.nextReportId = 1;
    this.nextRoomId = 1;
    this.nextMessageId = 1;
    this.nextRequestId = 1;

    // Initialize with pre-existing admin users
    this.initializeAdminUsers();
  }

  initializeAdminUsers() {
    // Pre-existing admin users - these should be provided by campus IT
    const adminUsers = [
      {
        id: 'admin-001',
        email: 'admin@campus.edu',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // "password"
        role: 'admin',
        anonymousId: 'admin-anon-001',
        isAnonymous: false,
        campusId: 'ADMIN001',
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString()
      },
      {
        id: 'admin-002',
        email: 'security@campus.edu',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // "password"
        role: 'admin',
        anonymousId: 'admin-anon-002',
        isAnonymous: false,
        campusId: 'ADMIN002',
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString()
      },
      {
        id: 'admin-003',
        email: 'normal@admin.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // "admin" (same hash as "password")
        role: 'admin',
        anonymousId: 'admin-anon-003',
        isAnonymous: false,
        campusId: 'ADMIN003',
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString()
      },
      {
        id: 'admin-004',
        email: 'Iapprove@admin.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // "approve" (same hash as "password")
        role: 'moderator',
        anonymousId: 'moderator-anon-001',
        isAnonymous: false,
        campusId: 'MOD001',
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString()
      },
      {
        id: 'moderator-001',
        email: 'moderator1@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // "moderatorpassword1"
        role: 'moderator',
        anonymousId: 'moderator-anon-002',
        isAnonymous: false,
        campusId: 'MOD002',
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString()
      }
    ];

    adminUsers.forEach(user => {
      this.users.set(user.id, user);
    });
  }

  // User operations
  createUser(userData) {
    const user = {
      id: this.nextUserId.toString(),
      ...userData,
      role: 'user', // Default role is user, not admin
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.users.set(user.id, user);
    this.nextUserId++;
    return user;
  }

  findUserByEmail(email) {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  findUserById(id) {
    return this.users.get(id) || null;
  }

  updateUser(id, updates) {
    const user = this.users.get(id);
    if (user) {
      Object.assign(user, updates, { updatedAt: new Date().toISOString() });
      this.users.set(id, user);
      return user;
    }
    return null;
  }

  // Admin request operations
  createAdminRequest(userId, requestData) {
    const request = {
      id: this.nextRequestId.toString(),
      userId,
      ...requestData,
      status: 'pending', // pending, approved, rejected
      createdAt: new Date().toISOString(),
      reviewedBy: null,
      reviewedAt: null,
      reviewNotes: null
    };
    this.adminRequests.set(request.id, request);
    this.nextRequestId++;
    return request;
  }

  getAdminRequests(status = null) {
    const requests = Array.from(this.adminRequests.values());
    if (status) {
      return requests.filter(req => req.status === status);
    }
    return requests;
  }

  updateAdminRequest(requestId, updates) {
    const request = this.adminRequests.get(requestId);
    if (request) {
      Object.assign(request, updates, { 
        reviewedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      this.adminRequests.set(requestId, request);
      return request;
    }
    return null;
  }

  approveAdminRequest(requestId, approvedBy, notes = '') {
    const request = this.updateAdminRequest(requestId, {
      status: 'approved',
      reviewedBy: approvedBy,
      reviewNotes: notes
    });

    if (request) {
      // Promote user to admin
      this.updateUser(request.userId, { role: 'admin' });
    }

    return request;
  }

  rejectAdminRequest(requestId, rejectedBy, notes = '') {
    return this.updateAdminRequest(requestId, {
      status: 'rejected',
      reviewedBy: rejectedBy,
      reviewNotes: notes
    });
  }

  // Report operations
  createReport(reportData) {
    const report = {
      id: this.nextReportId.toString(),
      ...reportData,
      status: 'pending',
      priority: 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: [],
      publicUpdates: []
    };
    this.reports.set(report.id, report);
    this.nextReportId++;
    return report;
  }

  findReportsByUserId(userId) {
    const userReports = [];
    for (const report of this.reports.values()) {
      if (report.userId === userId) {
        userReports.push(report);
      }
    }
    return userReports;
  }

  findReportById(id) {
    return this.reports.get(id) || null;
  }

  updateReport(id, updates) {
    const report = this.reports.get(id);
    if (report) {
      Object.assign(report, updates, { updatedAt: new Date().toISOString() });
      this.reports.set(id, report);
      return report;
    }
    return null;
  }

  // Chat operations
  createChatRoom(roomData) {
    const room = {
      roomId: this.nextRoomId.toString(),
      ...roomData,
      createdAt: new Date().toISOString(),
      lastMessage: null
    };
    this.chatRooms.set(room.roomId, room);
    this.nextRoomId++;
    return room;
  }

  findChatRoomByReportId(reportId) {
    for (const room of this.chatRooms.values()) {
      if (room.reportId === reportId) {
        return room;
      }
    }
    return null;
  }

  findChatRoomsByUserId(userId) {
    const userRooms = [];
    for (const room of this.chatRooms.values()) {
      if (room.userId === userId) {
        userRooms.push(room);
      }
    }
    return userRooms;
  }

  createMessage(messageData) {
    const message = {
      id: this.nextMessageId.toString(),
      ...messageData,
      timestamp: new Date().toISOString()
    };
    this.messages.set(message.id, message);
    this.nextMessageId++;
    return message;
  }

  findMessagesByRoomId(roomId) {
    const roomMessages = [];
    for (const message of this.messages.values()) {
      if (message.roomId === roomId) {
        roomMessages.push(message);
      }
    }
    return roomMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  // Admin operations
  getAllReports() {
    return Array.from(this.reports.values());
  }

  getAllUsers() {
    return Array.from(this.users.values());
  }

  getStats() {
    const totalUsers = this.users.size;
    const totalReports = this.reports.size;
    const pendingReports = Array.from(this.reports.values()).filter(r => r.status === 'pending').length;
    const resolvedReports = Array.from(this.reports.values()).filter(r => r.status === 'resolved').length;
    const pendingAdminRequests = this.getAdminRequests('pending').length;

    return {
      totalUsers,
      totalReports,
      pendingReports,
      resolvedReports,
      resolutionRate: totalReports > 0 ? (resolvedReports / totalReports * 100).toFixed(1) : 0,
      pendingAdminRequests
    };
  }
}

module.exports = new MemoryStore(); 