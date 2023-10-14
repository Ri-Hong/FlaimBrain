import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Define the structure of your form data
interface FormState {
  username: string;
  password: string;
}

const Login: React.FC = () => {
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
    // Authentication logic here (e.g., send data to backend)
    try {
      const response = await fetch('http://127.0.0.1:5000/auth/login', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (response.status === 401) {
        console.log('Unauthorized access - login failed.');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log('Success:', data);

        // Store the token (optional, based on your needs)
        localStorage.setItem('token', data.access_token);

        // Redirect to the homepage or dashboard, for example
        navigate('/home');
      } else {
        console.log('Error: Failed to login');
      }
    } catch (error) {
      // Handle errors
      console.error('An error occurred:', error);
    }
  };

  // Redirect to the registration page
  const goToRegister = () => {
    navigate('/register');
  };
    

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Login</button>

        <button onClick={goToRegister}>Go To Register</button>
      </form>

      
    </div>
  );
};

export default Login;
