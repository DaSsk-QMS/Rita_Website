import { lazy, Suspense, useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import { PageLoader } from '../components/ui/Loaders.jsx';
import AdminLayout from './AdminLayout.jsx';
import ResourceManager from './ResourceManager.jsx';
import { resources } from './resources.js';
import { Login, ForgotPassword, ResetPassword } from './pages/Auth.jsx';

const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Analytics = lazy(() => import('./pages/Analytics.jsx'));
const Enquiries = lazy(() => import('./pages/Enquiries.jsx'));
const Applications = lazy(() => import('./pages/Applications.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));
const MediaLibrary = lazy(() => import('./pages/MediaLibrary.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const FeedbackAdmin = lazy(() => import('./pages/Feedback.jsx'));
const Security = lazy(() => import('./pages/Security.jsx'));

function PostsManager() {
  const [cats, setCats] = useState([]);
  useEffect(() => { api.get('/admin/categories', { params: { limit: 200 } }).then(({ data }) => setCats(data.items.map((c) => c.name))).catch(() => {}); }, []);
  return <ResourceManager key={cats.join()} config={{ ...resources.posts, fields: resources.posts.fields(cats) }} />;
}

function Guard({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (role && user.role !== role) return <Navigate to="/admin" replace />;
  return children;
}

const R = (key) => <ResourceManager key={key} config={resources[key]} />;

export default function AdminApp() {
  return (
    <>
      <title>Admin Panel</title>
      <meta name="robots" content="noindex,nofollow" />
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />
        <Route element={<Guard><AdminLayout /></Guard>}>
          <Route index element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="enquiries" element={<Enquiries />} />
          <Route path="applications" element={<Applications />} />
          <Route path="feedback" element={<FeedbackAdmin />} />
          <Route path="subscribers" element={R('subscribers')} />
          <Route path="slides" element={R('slides')} />
          <Route path="services" element={R('services')} />
          <Route path="posts" element={<PostsManager />} />
          <Route path="categories" element={R('categories')} />
          <Route path="jobs" element={R('jobs')} />
          <Route path="gallery" element={R('gallery')} />
          <Route path="clients" element={R('clients')} />
          <Route path="locations" element={R('locations')} />
          <Route path="testimonials" element={R('testimonials')} />
          <Route path="team" element={R('team')} />
          <Route path="page-seo" element={R('pageSeo')} />
          <Route path="media" element={<MediaLibrary />} />
          <Route path="settings/:tab?" element={<Settings />} />
          <Route path="users" element={<Guard role="admin">{R('users')}</Guard>} />
          <Route path="security" element={<Guard role="admin"><Security /></Guard>} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </>
  );
}
