import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useNavigate, Link } from 'react-router-dom';
import { LOGIN } from '../graphql/operations';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, Card, CardBody } from '../components/ui';
import type { User } from '../types';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');

  const [loginMutation, { loading }] = useMutation<{
    login: { success: boolean; user: User; errors: string[] };
  }>(LOGIN);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    try {
      const { data } = await loginMutation({
        variables: {
          input: {
            email: formData.email,
            password: formData.password,
          },
        },
      });

      if (data?.login?.success && data.login.user) {
        login(data.login.user);
        const orgSlug = data.login.user.organization?.slug;
        if (orgSlug) {
          navigate(`/${orgSlug}`);
        } else {
          navigate('/');
        }
      } else if (data?.login?.errors?.length) {
        setServerError(data.login.errors.join(', '));
      }
    } catch (err) {
      setServerError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mini PMS</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <Card>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              {serverError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                  {serverError}
                </div>
              )}

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={errors.email}
                placeholder="you@example.com"
              />

              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={errors.password}
                placeholder="Enter your password"
              />

              <Button type="submit" loading={loading} className="w-full">
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                Register your organization
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
