import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout.jsx';
import Home from './pages/Home.jsx';
import { PageLoader } from './components/ui/Loaders.jsx';

const About = lazy(() => import('./pages/About.jsx'));
const Services = lazy(() => import('./pages/Services.jsx'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail.jsx'));
const Blog = lazy(() => import('./pages/Blog.jsx'));
const BlogPost = lazy(() => import('./pages/BlogPost.jsx'));
const Careers = lazy(() => import('./pages/Careers.jsx'));
const JobDetail = lazy(() => import('./pages/JobDetail.jsx'));
const Gallery = lazy(() => import('./pages/Gallery.jsx'));
const Clients = lazy(() => import('./pages/Clients.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const SearchPage = lazy(() => import('./pages/Search.jsx'));
const Legal = lazy(() => import('./pages/Legal.jsx'));
const Locations = lazy(() => import('./pages/Locations.jsx'));
const LocationDetail = lazy(() => import('./pages/LocationDetail.jsx'));
const Feedback = lazy(() => import('./pages/Feedback.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'));

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<Services />} />
          <Route path="services/:slug" element={<ServiceDetail />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<BlogPost />} />
          <Route path="careers" element={<Careers />} />
          <Route path="careers/:slug" element={<JobDetail />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="clients" element={<Clients />} />
          <Route path="contact" element={<Contact />} />
          <Route path="locations" element={<Locations />} />
          <Route path="locations/:slug" element={<LocationDetail />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="privacy-policy" element={<Legal page="privacy" />} />
          <Route path="terms" element={<Legal page="terms" />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
