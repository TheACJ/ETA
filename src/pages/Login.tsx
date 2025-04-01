import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

interface LoginFormData {
  username: string;
  password: string;
}

export default function Login(): JSX.Element {
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
  });
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implement login logic
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#c2d4d8]">
      <div className="bg-white p-8 rounded-lg shadow-custom border border-[#6675df] w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logo} alt="Logo" className="h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-kalam text-gray-900">The ACJ - ETA</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="form-input mt-1"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-input mt-1"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          
          <button type="submit" className="btn-primary w-full">
            Login
          </button>
        </form>
      </div>
    </div>
  );
} 