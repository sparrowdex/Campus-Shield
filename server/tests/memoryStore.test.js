const MemoryStore = require('../services/memoryStore');

describe('MemoryStore', () => {
  let memoryStore;

  beforeEach(() => {
    // Create a new instance of MemoryStore for each test
    memoryStore = new MemoryStore();
  });

  describe('User Operations', () => {
    it('should create a new user with default role', () => {
      const userData = { email: 'test@example.com', password: 'password123', campusId: '123' };
      const user = memoryStore.createUser(userData);

      expect(user).toBeDefined();
      expect(user.id).toBe('1');
      expect(user.email).toBe('test@example.com');
      expect(user.role).toBe('user'); // Default role should be 'user'
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it('should find a user by email', () => {
      const userData = { email: 'findme@example.com', password: 'password123' };
      memoryStore.createUser(userData);

      const foundUser = memoryStore.findUserByEmail('findme@example.com');
      expect(foundUser).toBeDefined();
      expect(foundUser.email).toBe('findme@example.com');
    });

    it('should return null if user is not found by email', () => {
      const foundUser = memoryStore.findUserByEmail('dontexist@example.com');
      expect(foundUser).toBeNull();
    });

    it('should find a user by ID', () => {
      const userData = { email: 'findbyid@example.com', password: 'password123' };
      const user = memoryStore.createUser(userData);

      const foundUser = memoryStore.findUserById(user.id);
      expect(foundUser).toBeDefined();
      expect(foundUser.id).toBe(user.id);
    });

    it('should return null if user is not found by ID', () => {
      const foundUser = memoryStore.findUserById('nonexistentid');
      expect(foundUser).toBeNull();
    });

    it('should update a user', async () => {
      const userData = { email: 'update@example.com', password: 'password123', role: 'user' };
      const user = memoryStore.createUser(userData);
      const initialUpdatedAt = user.updatedAt;

      // Wait a moment to ensure the timestamp will be different
      await new Promise(resolve => setTimeout(resolve, 10));

      const updates = { role: 'admin' };
      const updatedUser = memoryStore.updateUser(user.id, updates);

      expect(updatedUser).toBeDefined();
      expect(updatedUser.role).toBe('admin');
      expect(updatedUser.email).toBe('update@example.com');
      // Ensure updatedAt is greater than the initial one
      expect(new Date(updatedUser.updatedAt) > new Date(initialUpdatedAt)).toBe(true);
    });

    it('should return null when trying to update a nonexistent user', () => {
      const updatedUser = memoryStore.updateUser('nonexistentid', { role: 'admin' });
      expect(updatedUser).toBeNull();
    });
  });
});
