import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode'; // make sure your installed version supports this
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Import components
import Login from './components/Login';
import Register from './components/Register';
import SubmitProject from './components/SubmitProject';
import PendingProjects from './components/PendingProjects';
import Gallery from './components/Gallery';
import ProjectDetails from './components/ProjectDetails';
import Dashboard from './components/Dashboard';

// Protected Route Component
const ProtectedRoute = ({ children, roles = [] }) => {
  const token = localStorage.getItem('token');

  if (!token) return <Navigate to="/login" replace />;

  try {
    const user = jwtDecode(token);
    if (roles.length && !roles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
    return children;
  } catch (error) {
    console.error('Invalid token:', error);
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }
};

// Navigation Component
const Navigation = () => {
  const token = localStorage.getItem('token');
  let userRole = null;
  let username = localStorage.getItem('username');

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userRole = decoded.role;
      username = username || decoded.username;
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '/';
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">UCU Innovators Hub</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Gallery</Nav.Link>
            {token && userRole === 'student' && <Nav.Link as={Link} to="/submit">Submit Project</Nav.Link>}
            {(userRole === 'supervisor' || userRole === 'admin') && <Nav.Link as={Link} to="/pending">Review Projects</Nav.Link>}
            {userRole === 'admin' && <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>}
          </Nav>
          <Nav>
            {token ? (
              <NavDropdown
                title={<><i className="bi bi-person-circle me-1"></i>{username || 'User'}</>}
                id="basic-nav-dropdown"
                align="end"
              >
                <NavDropdown.Item as={Link} to="/profile">
                  <i className="bi bi-person me-2"></i>Profile
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="me-2">
                  <i className="bi bi-box-arrow-in-right me-1"></i>Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register" className="btn btn-outline-light btn-sm">
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

// Main App Component
function App() {
  return (
    <div className="App d-flex flex-column min-vh-100">
      <Navigation />
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Gallery />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/submit" element={<ProtectedRoute roles={['student']}><SubmitProject /></ProtectedRoute>} />
          <Route path="/pending" element={<ProtectedRoute roles={['supervisor','admin']}><PendingProjects /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute roles={['admin']}><Dashboard /></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="bg-dark text-white py-4 mt-5">
        <Container>
          <div className="row">
            <div className="col-md-6">
              <h5>UCU Innovators Hub</h5>
              <p className="mb-0">Showcasing innovation and research from Uganda Christian University</p>
            </div>
            <div className="col-md-3">
              <h5>Quick Links</h5>
              <ul className="list-unstyled">
                <li><Link to="/" className="text-white text-decoration-none">Home</Link></li>
                <li><Link to="/submit" className="text-white text-decoration-none">Submit Project</Link></li>
                <li><Link to="/login" className="text-white text-decoration-none">Login</Link></li>
              </ul>
            </div>
            <div className="col-md-3">
              <h5>Contact</h5>
              <address>
                Uganda Christian University<br />
                P.O. Box 4, Mukono, Uganda<br />
                Email: info@ucu.ac.ug
              </address>
            </div>
          </div>
          <hr className="my-3" />
          <div className="text-center">
            <p className="mb-0">&copy; {new Date().getFullYear()} UCU Innovators Hub. All rights reserved.</p>
          </div>
        </Container>
      </footer>
    </div>
  );
}

export default App;
