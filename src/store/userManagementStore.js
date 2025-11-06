import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

const ROLE_PERMISSIONS = {
  'Super Admin': {
    dashboard: { view: true, edit: true },
    jobs: { view: true, edit: true, delete: true, create: true },
    customer: { view: true, edit: true, delete: true, create: true },
    vendor: { view: true, edit: true, delete: true, create: true },
    supplier: { view: true, edit: true, delete: true, create: true },
    labour: { view: true, edit: true, delete: true, create: true },
    inventory: { view: true, edit: true, delete: true, create: true },
    accounts: { view: true, edit: true, delete: true, create: true },
    cashRecipt: { view: true, edit: true, delete: true, create: true },
    settings: { view: true, edit: true },
    userManagement: { view: true, edit: true, delete: true, create: true },
  },
  'Admin': {
    dashboard: { view: true, edit: true },
    jobs: { view: true, edit: true, delete: true, create: true },
    customer: { view: true, edit: true, delete: true, create: true },
    vendor: { view: true, edit: true, delete: true, create: true },
    supplier: { view: true, edit: true, delete: true, create: true },
    labour: { view: true, edit: true, delete: true, create: true },
    inventory: { view: true, edit: true, delete: true, create: true },
    accounts: { view: true, edit: true, delete: false, create: true },
    cashRecipt: { view: true, edit: true, delete: false, create: true },
    settings: { view: true, edit: true },
    userManagement: { view: true, edit: false, delete: false, create: false },
  },
  'Manager': {
    dashboard: { view: true, edit: false },
    jobs: { view: true, edit: true, delete: false, create: true },
    customer: { view: true, edit: true, delete: false, create: true },
    vendor: { view: true, edit: true, delete: false, create: true },
    supplier: { view: true, edit: true, delete: false, create: true },
    labour: { view: true, edit: true, delete: false, create: true },
    inventory: { view: true, edit: true, delete: false, create: true },
    accounts: { view: true, edit: false, delete: false, create: false },
    cashRecipt: { view: true, edit: false, delete: false, create: false },
    settings: { view: true, edit: false },
    userManagement: { view: false, edit: false, delete: false, create: false },
  },
  'Accountant': {
    dashboard: { view: true, edit: false },
    jobs: { view: true, edit: false, delete: false, create: false },
    customer: { view: true, edit: false, delete: false, create: false },
    vendor: { view: true, edit: false, delete: false, create: false },
    supplier: { view: true, edit: false, delete: false, create: false },
    labour: { view: true, edit: false, delete: false, create: false },
    inventory: { view: true, edit: false, delete: false, create: false },
    accounts: { view: true, edit: true, delete: true, create: true },
    cashRecipt: { view: true, edit: true, delete: true, create: true },
    settings: { view: false, edit: false },
    userManagement: { view: false, edit: false, delete: false, create: false },
  },
  'Employee': {
    dashboard: { view: true, edit: false },
    jobs: { view: true, edit: false, delete: false, create: false },
    customer: { view: true, edit: false, delete: false, create: false },
    vendor: { view: true, edit: false, delete: false, create: false },
    supplier: { view: true, edit: false, delete: false, create: false },
    labour: { view: true, edit: false, delete: false, create: false },
    inventory: { view: true, edit: false, delete: false, create: false },
    accounts: { view: false, edit: false, delete: false, create: false },
    cashRecipt: { view: false, edit: false, delete: false, create: false },
    settings: { view: false, edit: false },
    userManagement: { view: false, edit: false, delete: false, create: false },
  },
  'Read Only': {
    dashboard: { view: true, edit: false },
    jobs: { view: true, edit: false, delete: false, create: false },
    customer: { view: true, edit: false, delete: false, create: false },
    vendor: { view: true, edit: false, delete: false, create: false },
    supplier: { view: true, edit: false, delete: false, create: false },
    labour: { view: true, edit: false, delete: false, create: false },
    inventory: { view: true, edit: false, delete: false, create: false },
    accounts: { view: true, edit: false, delete: false, create: false },
    cashRecipt: { view: true, edit: false, delete: false, create: false },
    settings: { view: false, edit: false },
    userManagement: { view: false, edit: false, delete: false, create: false },
  },
};

const useUserManagementStore = create(
  persist(
    (set) => ({
      users: [
        {
          id: 'default-user',
          name: 'Super Admin',
          email: 'admin@malwatrolley.com',
          username: 'admin',
          password: 'admin123',
          role: 'Super Admin',
          branch: 'Head Office',
          status: 'Active',
          permissions: ROLE_PERMISSIONS['Super Admin'],
          createdAt: new Date().toISOString(),
          lastLogin: null,
        },
      ],

      addUser: (user) => set((state) => {
        const defaultPassword = 'Pass@123';
        const username = user.email.split('@')[0];
        return {
          users: [...state.users, {
            id: uuidv4(),
            status: 'Active',
            username,
            password: defaultPassword,
            permissions: ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS['Employee'],
            createdAt: new Date().toISOString(),
            lastLogin: null,
            ...user
          }],
        };
      }),

      updateUser: (updatedUser) => set((state) => ({
        users: state.users.map((u) => {
          if (u.id === updatedUser.id) {
            return {
              ...u,
              ...updatedUser,
              permissions: ROLE_PERMISSIONS[updatedUser.role] || u.permissions,
            };
          }
          return u;
        }),
      })),

      deleteUser: (userId) => set((state) => ({
        users: state.users.filter((u) => u.id !== userId),
      })),

      blockUser: (userId) => set((state) => ({
        users: state.users.map((u) =>
          u.id === userId ? { ...u, status: 'Blocked' } : u
        ),
      })),

      unblockUser: (userId) => set((state) => ({
        users: state.users.map((u) =>
          u.id === userId ? { ...u, status: 'Active' } : u
        ),
      })),

      resetPassword: (userId, newPassword) => set((state) => ({
        users: state.users.map((u) =>
          u.id === userId ? { ...u, password: newPassword } : u
        ),
      })),

      updateLastLogin: (userId) => set((state) => ({
        users: state.users.map((u) =>
          u.id === userId ? { ...u, lastLogin: new Date().toISOString() } : u
        ),
      })),

      getRolePermissions: (role) => ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS['Employee'],
    }),
    { name: 'user-management-storage' }
  )
);

export { ROLE_PERMISSIONS };
export default useUserManagementStore;
