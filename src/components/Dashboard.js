import React, { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    projectsByFaculty: [],
    projectsByCategory: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        const [analyticsRes, projectsRes] = await Promise.all([
          axios.get('http://localhost:5000/analytics', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/projects/approved')
        ]);

        const { projectsPerFaculty, approvalRates } = analyticsRes.data;
        
        const pending = approvalRates.find(r => r.status === 'pending')?.count || 0;
        const approved = approvalRates.find(r => r.status === 'approved')?.count || 0;
        const rejected = approvalRates.find(r => r.status === 'rejected')?.count || 0;

        // Process category data
        const categoryMap = {};
        projectsRes.data.forEach(project => {
          categoryMap[project.category] = (categoryMap[project.category] || 0) + 1;
        });
        const projectsByCategory = Object.entries(categoryMap).map(([name, count]) => ({
          name,
          count
        }));

        setStats({
          totalProjects: pending + approved + rejected,
          pendingCount: pending,
          approvedCount: approved,
          rejectedCount: rejected,
          projectsByFaculty: projectsPerFaculty,
          projectsByCategory
        });
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load dashboard data. Please try again later.');
        if (err.response?.status === 401) {
          setError('Unauthorized access. Please login as admin.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Data for charts
  const facultyData = {
    labels: stats.projectsByFaculty.map(item => item.faculty || 'Uncategorized'),
    datasets: [
      {
        label: 'Projects by Faculty',
        data: stats.projectsByFaculty.map(item => item.count),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const categoryData = {
    labels: stats.projectsByCategory.map(item => item.name),
    datasets: [
      {
        data: stats.projectsByCategory.map(item => item.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Projects by Faculty',
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Projects by Category',
      },
    },
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
        <Link to="/" className="btn btn-primary mt-3">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Admin Dashboard</h1>
        <div>
          <Link to="/pending" className="btn btn-outline-primary me-2">
            Review Projects
          </Link>
          <Link to="/" className="btn btn-primary">
            View Gallery
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card text-white bg-primary h-100">
            <div className="card-body">
              <h5 className="card-title">Total Projects</h5>
              <h2 className="mb-0">{stats.totalProjects}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-white bg-warning h-100">
            <div className="card-body">
              <h5 className="card-title">Pending Review</h5>
              <h2 className="mb-0">{stats.pendingCount}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-white bg-success h-100">
            <div className="card-body">
              <h5 className="card-title">Approved</h5>
              <h2 className="mb-0">{stats.approvedCount}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-white bg-danger h-100">
            <div className="card-body">
              <h5 className="card-title">Rejected</h5>
              <h2 className="mb-0">{stats.rejectedCount}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row mb-4">
        <div className="col-lg-8 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <Bar data={facultyData} options={barOptions} />
            </div>
          </div>
        </div>
        <div className="col-lg-4 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <Pie data={categoryData} options={pieOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Recent Activity</h5>
              <div className="list-group list-group-flush">
                <div className="list-group-item">
                  <div className="d-flex w-100 justify-content-between">
                    <h6 className="mb-1">System Update</h6>
                    <small>Just now</small>
                  </div>
                  <p className="mb-1">Dashboard refreshed with latest data</p>
                </div>
                {stats.pendingCount > 0 && (
                  <div className="list-group-item">
                    <div className="d-flex w-100 justify-content-between">
                      <h6 className="mb-1">Pending Reviews</h6>
                      <small>New</small>
                    </div>
                    <p className="mb-1">
                      You have {stats.pendingCount} projects waiting for review
                    </p>
                    <Link to="/pending" className="btn btn-sm btn-outline-primary mt-2">
                      Review Now
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title mb-4">Quick Actions</h5>
              <div className="d-grid gap-3">
                <Link to="/pending" className="btn btn-outline-primary">
                  <i className="bi bi-list-check me-2"></i>
                  Review Pending Projects
                </Link>
                <Link to="/" className="btn btn-outline-secondary">
                  <i className="bi bi-grid me-2"></i>
                  View Project Gallery
                </Link>
                <button className="btn btn-outline-success">
                  <i className="bi bi-file-earmark-arrow-down me-2"></i>
                  Generate Report
                </button>
                <button className="btn btn-outline-danger">
                  <i className="bi bi-gear me-2"></i>
                  System Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
