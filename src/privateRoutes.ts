// Routes configuration
export const privateRoutes = [
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/lessons/[id]', name: 'Lesson Detail' },
  { path: '/my-progress', name: 'My Progress' },
  { path: '/profile', name: 'Profile' },
  { path: '/admin', name: 'Admin Panel', role: 'admin' },
  { path: '/admin/users', name: 'User Management', role: 'admin' },
  { path: '/admin/courses', name: 'Course Management', role: 'admin' },
];

export default privateRoutes;
