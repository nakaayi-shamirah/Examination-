import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/projects/${id}`);
        setProject(res.data);
        setError('');
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleDownload = () => {
    if (project?.document_path) {
      window.open(`http://localhost:5000/${project.document_path}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading project details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
        <button 
          className="btn btn-primary mt-3" 
          onClick={() => navigate(-1)}
        >
          Back to Gallery
        </button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">Project not found</div>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate('/')}
        >
          Back to Gallery
        </button>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <button 
        className="btn btn-outline-secondary mb-4" 
        onClick={() => navigate(-1)}
      >
        ← Back to Gallery
      </button>

      <div className="card shadow-sm">
        <div className="card-body p-4">
          <div className="row">
            <div className="col-lg-8">
              <h1 className="mb-3">{project.title}</h1>
              
              <div className="d-flex align-items-center mb-4">
                <span className="badge bg-primary me-2">{project.category}</span>
                <span className="text-muted">
                  Submitted by {project.student_name} • {new Date(project.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>

              <div className="mb-4">
                <h5>Project Description</h5>
                <div className="p-3 bg-light rounded" style={{ whiteSpace: 'pre-line' }}>
                  {project.description}
                </div>
              </div>

              <div className="mb-4">
                <h5>Technologies Used</h5>
                <div>
                  {project.technologies.split(',').map((tech, i) => (
                    <span key={i} className="badge bg-secondary me-2 mb-2">
                      {tech.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {project.supervisor_comments && (
                <div className="alert alert-warning">
                  <h5>Supervisor's Feedback</h5>
                  <p className="mb-2">{project.supervisor_comments}</p>
                  <span className={`badge ${project.status === 'approved' ? 'bg-success' : 'bg-danger'}`}>
                    {project.status.toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div className="col-lg-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Project Details</h5>
                  <hr />
                  
                  <div className="mb-3">
                    <h6>Status</h6>
                    <span className={`badge ${
                      project.status === 'approved' ? 'bg-success' :
                      project.status === 'pending' ? 'bg-warning text-dark' : 'bg-danger'
                    }`}>
                      {project.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="mb-3">
                    <h6>Faculty</h6>
                    <p className="mb-0">{project.faculty || 'N/A'}</p>
                  </div>

                  <div className="mb-3">
                    <h6>Year</h6>
                    <p className="mb-0">{project.year || 'N/A'}</p>
                  </div>

                  {project.document_path && (
                    <div className="d-grid gap-2">
                      <button 
                        className="btn btn-outline-primary"
                        onClick={handleDownload}
                      >
                        <i className="bi bi-download me-2"></i>
                        Download Project Document
                      </button>
                    </div>
                  )}

                  {project.status === 'pending' && localStorage.getItem('token') && (
                    <div className="alert alert-info mt-3 mb-0">
                      <small>
                        <i className="bi bi-info-circle me-1"></i>
                        This project is under review. Check back later for updates.
                      </small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
