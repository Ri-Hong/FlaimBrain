import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

// Define the structure of your form data
interface FormState {
  username: string;
  password: string;
}

const Register: React.FC = () => {
  // Set initial form state
  const [form, setForm] = useState<FormState>({ username: '', password: '' });

  // Initialize the navigate function
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Registration logic here (e.g., send data to backend)
    try {
      const response = await fetch('http://127.0.0.1:5000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        console.log('Success: User registered!');
        // Optionally, redirect them to the login page after successful registration
        navigate('/login');
      } else {
        console.log('Error: Failed to register');
      }
    } catch (error) {
      // Handle errors
      console.error('An error occurred:', error);
    }
  };

  // Redirect to the login page
  const goToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="login-container">
      <h2 className="login-header">Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-container">
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-container">
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <button className="login-buttons" type="submit">Register</button>
        <button className="login-buttons" onClick={goToLogin}>Go To Login</button>
      </form>
    </div>
  );
};

export default Register;
