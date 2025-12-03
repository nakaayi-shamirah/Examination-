import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SubmitProject = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [document, setDocument] = useState(null);
  const [year, setYear] = useState('');
  const [faculty, setFaculty] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/categories').then(res => setCategories(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('technologies', technologies);
    formData.append('document', document);
    formData.append('year', year);
    formData.append('faculty', faculty);

    try {
      await axios.post('http://localhost:5000/projects', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Project Submitted Successfully!');
      // Reset form
      setTitle(''); 
      setDescription(''); 
      setTechnologies(''); 
      setYear(''); 
      setFaculty('');
      document.getElementById('document-upload').value = '';
    } catch (err) {
      console.error('Submission error:', err);
      alert('Failed to submit. Please try again.');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Submit Your Innovation</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Project Title</label>
                  <input 
                    className="form-control" 
                    placeholder="Enter project title" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    required 
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea 
                    className="form-control" 
                    rows="4" 
                    placeholder="Describe your project..." 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    required 
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Category</label>
                    <select 
                      className="form-select" 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)} 
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Technologies Used</label>
                    <input 
                      className="form-control" 
                      placeholder="e.g., React, Node.js, MongoDB" 
                      value={technologies} 
                      onChange={(e) => setTechnologies(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Year</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      placeholder="e.g., 2023" 
                      value={year} 
                      onChange={(e) => setYear(e.target.value)} 
                      min="2000"
                      max="2030"
                      required 
                    />
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Faculty</label>
                    <input 
                      className="form-control" 
                      placeholder="e.g., Engineering" 
                      value={faculty} 
                      onChange={(e) => setFaculty(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label">Project Document (PDF only)</label>
                  <input 
                    id="document-upload"
                    type="file" 
                    className="form-control" 
                    accept=".pdf" 
                    onChange={(e) => setDocument(e.target.files[0])} 
                    required 
                  />
                  <div className="form-text">
                    Upload your project documentation in PDF format (max 5MB)
                  </div>
                </div>

                <div className="d-grid">
                  <button type="submit" className="btn btn-primary btn-lg">
                    Submit Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitProject;
