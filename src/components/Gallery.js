import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Gallery = () => {
  const [projects, setProjects] = useState([]);
  const [filterFaculty, setFilterFaculty] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterTech, setFilterTech] = useState('');
  const [categories, setCategories] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, categoriesRes] = await Promise.all([
          axios.get('http://localhost:5000/projects/approved'),
          axios.get('http://localhost:5000/categories')
        ]);

        setProjects(projectsRes.data);
        setCategories(categoriesRes.data);
        
        // Extract unique faculties and years
        const facultiesList = [...new Set(projectsRes.data.map(p => p.faculty))];
        const yearsList = [...new Set(projectsRes.data.map(p => p.year))].sort((a, b) => b - a);
        
        setFaculties(facultiesList);
        setYears(yearsList);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); 

  const filteredProjects = projects.filter(project => {
    const matchesFaculty = !filterFaculty || 
      project.faculty.toLowerCase().includes(filterFaculty.toLowerCase());
    
    const matchesCategory = !filterCategory || 
      project.category.toLowerCase().includes(filterCategory.toLowerCase());
    
    const matchesYear = !filterYear || 
      project.year.toString() === filterYear.toString();
    
    const matchesTech = !filterTech || 
      project.technologies.toLowerCase().includes(filterTech.toLowerCase());
    
    return matchesFaculty && matchesCategory && matchesYear && matchesTech;
  });

  const clearFilters = () => {
    setFilterFaculty('');
    setFilterCategory('');
    setFilterYear('');
    setFilterTech('');
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3">Project Gallery</h1>
        {localStorage.getItem('token') ? (
          <Link to="/submit" className="btn btn-primary">
            Submit Your Project
          </Link>
        ) : (
          <div>
            <Link to="/login" className="btn btn-outline-primary me-2">Login</Link>
            <Link to="/register" className="btn btn-primary">Register</Link>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Filter Projects</h5>
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Faculty</label>
              <select 
                className="form-select"
                value={filterFaculty}
                onChange={(e) => setFilterFaculty(e.target.value)}
              >
                <option value="">All Faculties</option>
                {faculties.map((faculty, index) => (
                  <option key={index} value={faculty}>
                    {faculty}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-3">
              <label className="form-label">Category</label>
              <select 
                className="form-select"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-2">
              <label className="form-label">Year</label>
              <select 
                className="form-select"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
              >
                <option value="">All Years</option>
                {years.map((year, index) => (
                  <option key={index} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-3">
              <label className="form-label">Technology</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., React, Node.js"
                value={filterTech}
                onChange={(e) => setFilterTech(e.target.value)}
              />
            </div>
            
            <div className="col-md-1 d-flex align-items-end">
              <button 
                className="btn btn-outline-secondary w-100"
                onClick={clearFilters}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="alert alert-info">
          No projects found matching your criteria.
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {filteredProjects.map(project => (
            <div className="col" key={project.id}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">
                    <Link 
                      to={`/projects/${project.id}`}
                      className="text-decoration-none text-dark"
                    >
                      {project.title}
                    </Link>
                  </h5>
                  <h6 className="card-subtitle mb-2 text-muted">
                    {project.student_name} • {project.year}
                  </h6>
                  <p className="card-text text-truncate-3" style={{ height: '4.5em' }}>
                    {project.description}
                  </p>
                  <div className="mb-2">
                    <span className="badge bg-primary me-1">{project.category}</span>
                    <span className="badge bg-secondary">{project.faculty}</span>
                  </div>
                  <div className="mb-2">
                    {project.technologies.split(',').slice(0, 3).map((tech, i) => (
                      <span key={i} className="badge bg-light text-dark me-1 mb-1">
                        {tech.trim()}
                      </span>
                    ))}
                    {project.technologies.split(',').length > 3 && (
                      <span className="badge bg-light text-dark">+{project.technologies.split(',').length - 3} more</span>
                    )}
                  </div>
                </div>
                <div className="card-footer bg-transparent">
                  <Link 
                    to={`/projects/${project.id}`}
                    className="btn btn-outline-primary btn-sm w-100"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;
