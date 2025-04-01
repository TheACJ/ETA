import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Form } from '../../components/ui/Form';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { termSessionAPI } from '../../services/api';

export default function TermSession() {
  const [terms, setTerms] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTermForm, setShowTermForm] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [termFormData, setTermFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    is_active: false
  });
  const [sessionFormData, setSessionFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    is_active: false
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [termsRes, sessionsRes] = await Promise.all([
          termSessionAPI.getAll(),
          termSessionAPI.getAll(),
        ]);
        setTerms(termsRes.data.results.filter(item => item.type === 'TERM'));
        setSessions(sessionsRes.data.results.filter(item => item.type === 'SESSION'));
      } catch (err) {
        setError('Failed to load term and session data');
        console.error('Term/Session data error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTermChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTermFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSessionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSessionFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTermSubmit = async (e) => {
    e.preventDefault();
    try {
      await termSessionAPI.create({
        ...termFormData,
        type: 'TERM'
      });
      
      // Reset form and refresh terms
      setTermFormData({
        name: '',
        start_date: '',
        end_date: '',
        is_active: false
      });
      setShowTermForm(false);

      const termsRes = await termSessionAPI.getAll();
      setTerms(termsRes.data.results.filter(item => item.type === 'TERM'));
    } catch (err) {
      setError('Failed to create term');
      console.error('Term creation error:', err);
    }
  };

  const handleSessionSubmit = async (e) => {
    e.preventDefault();
    try {
      await termSessionAPI.create({
        ...sessionFormData,
        type: 'SESSION'
      });
      
      // Reset form and refresh sessions
      setSessionFormData({
        name: '',
        start_date: '',
        end_date: '',
        is_active: false
      });
      setShowSessionForm(false);

      const sessionsRes = await termSessionAPI.getAll();
      setSessions(sessionsRes.data.results.filter(item => item.type === 'SESSION'));
    } catch (err) {
      setError('Failed to create session');
      console.error('Session creation error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await termSessionAPI.delete(id);
      const [termsRes, sessionsRes] = await Promise.all([
        termSessionAPI.getAll(),
        termSessionAPI.getAll(),
      ]);
      setTerms(termsRes.data.results.filter(item => item.type === 'TERM'));
      setSessions(sessionsRes.data.results.filter(item => item.type === 'SESSION'));
    } catch (err) {
      setError('Failed to delete item');
      console.error('Delete error:', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Terms Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Academic Terms</h1>
            <Button onClick={() => setShowTermForm(true)}>
              Add New Term
            </Button>
          </div>

          {showTermForm && (
            <Card className="p-6 mb-6">
              <Form onSubmit={handleTermSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Term Name
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={termFormData.name}
                      onChange={handleTermChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <Input
                      type="date"
                      name="start_date"
                      value={termFormData.start_date}
                      onChange={handleTermChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <Input
                      type="date"
                      name="end_date"
                      value={termFormData.end_date}
                      onChange={handleTermChange}
                      required
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={termFormData.is_active}
                      onChange={handleTermChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Active Term
                    </label>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowTermForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Create Term
                  </Button>
                </div>
              </Form>
            </Card>
          )}

          <div className="space-y-4">
            {terms.map(term => (
              <Card key={term.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{term.name}</h3>
                    <p className="text-gray-600">
                      {new Date(term.start_date).toLocaleDateString()} - {new Date(term.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(term.id)}
                  >
                    Delete
                  </Button>
                </div>
                <div className="mt-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    term.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {term.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Sessions Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Academic Sessions</h1>
            <Button onClick={() => setShowSessionForm(true)}>
              Add New Session
            </Button>
          </div>

          {showSessionForm && (
            <Card className="p-6 mb-6">
              <Form onSubmit={handleSessionSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Session Name
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={sessionFormData.name}
                      onChange={handleSessionChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <Input
                      type="date"
                      name="start_date"
                      value={sessionFormData.start_date}
                      onChange={handleSessionChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <Input
                      type="date"
                      name="end_date"
                      value={sessionFormData.end_date}
                      onChange={handleSessionChange}
                      required
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={sessionFormData.is_active}
                      onChange={handleSessionChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Active Session
                    </label>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowSessionForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Create Session
                  </Button>
                </div>
              </Form>
            </Card>
          )}

          <div className="space-y-4">
            {sessions.map(session => (
              <Card key={session.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{session.name}</h3>
                    <p className="text-gray-600">
                      {new Date(session.start_date).toLocaleDateString()} - {new Date(session.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(session.id)}
                  >
                    Delete
                  </Button>
                </div>
                <div className="mt-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    session.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {session.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 