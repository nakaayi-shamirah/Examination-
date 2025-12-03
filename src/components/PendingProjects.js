import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PendingProjects = () => {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPendingProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/projects/pending', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setProjects(res.data);
      } catch (err) {
        console.error('Error fetching pending projects:', err);
        if (err.response?.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchPendingProjects();
  }, [navigate]);

  const handleUpdate = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      let comments = '';
      
      if (status === 'rejected') {
        comments = prompt('Please provide a reason for rejection:');
        if (comments === null) return; // User cancelled
      }

      await axios.put(
        `http://localhost:5000/projects/${id}`, 
        { status, comments }, 
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Remove the updated project from the list
      setProjects(projects.filter(project => project.id !== id));
      alert(`Project ${status} successfully!`);
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update project status');
    }
  };

  const viewProjectDetails = (id) => {
    navigate(`/projects/${id}`);
  };

  if (projects.length === 0) {
    return (
      <div className="container mt-5">
        <div className="alert alert-info">
          No pending projects to review.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Pending Projects for Review</h2>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th>Title</th>
              <th>Student</th>
              <th>Faculty</th>
              <th>Category</th>
              <th>Submitted On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(project => (
              <tr key={project.id}>
                <td>
                  <button 
                    className="btn btn-link p-0 text-decoration-none"
                    onClick={() => viewProjectDetails(project.id)}
                  >
                    {project.title}
                  </button>
                </td>
                <td>{project.username || 'N/A'}</td>
                <td>{project.faculty}</td>
                <td>{project.category}</td>
                <td>{new Date(project.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="btn-group">
                    <button 
                      className="btn btn-sm btn-outline-success me-2"
                      onClick={() => handleUpdate(project.id, 'approved')}
                    >
                      Approve
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleUpdate(project.id, 'rejected')}
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PendingProjects;
