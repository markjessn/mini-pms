import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useNavigate, Link } from 'react-router-dom';
import { REGISTER } from '../graphql/operations';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, Card, CardBody } from '../components/ui';
import type { User, Organization } from '../types';

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    organizationSlug: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');

  const [registerMutation, { loading }] = useMutation<{
    register: { success: boolean; user: User; organization: Organization; errors: string[] };
  }>(REGISTER);

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email';
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.organizationName.trim() || formData.organizationName.trim().length < 2) {
      newErrors.organizationName = 'Organization name must be at least 2 characters';
    }

    if (!formData.organizationSlug.trim()) {
      newErrors.organizationSlug = 'Organization slug is required';
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.organizationSlug)) {
      newErrors.organizationSlug = 'Slug must contain only lowercase letters, numbers, and hyphens';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    try {
      const { data } = await registerMutation({
        variables: {
          input: {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            organizationName: formData.organizationName,
            organizationSlug: formData.organizationSlug,
          },
        },
      });

      if (data?.register?.success && data.register.user) {
        login(data.register.user);
        const orgSlug = data.register.organization?.slug;
        if (orgSlug) {
          navigate(`/${orgSlug}`);
        } else {
          navigate('/');
        }
      } else if (data?.register?.errors?.length) {
        setServerError(data.register.errors.join(', '));
      }
    } catch (err) {
      setServerError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mini PMS</h1>
          <p className="text-gray-600">Register your organization</p>
        </div>

        <Card>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              {serverError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                  {serverError}
                </div>
              )}

              <div className="border-b pb-4 mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Your Details</h3>

                <div className="space-y-4">
                  <Input
                    label="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    error={errors.name}
                    placeholder="John Doe"
                  />

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
                    placeholder="At least 6 characters"
                  />

                  <Input
                    label="Confirm Password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    error={errors.confirmPassword}
                    placeholder="Confirm your password"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Organization Details</h3>

                <div className="space-y-4">
                  <Input
                    label="Organization Name"
                    value={formData.organizationName}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        organizationName: e.target.value,
                        organizationSlug: generateSlug(e.target.value),
                      });
                    }}
                    error={errors.organizationName}
                    placeholder="My Company"
                  />

                  <Input
                    label="Organization Slug"
                    value={formData.organizationSlug}
                    onChange={(e) => setFormData({ ...formData, organizationSlug: e.target.value.toLowerCase() })}
                    error={errors.organizationSlug}
                    placeholder="my-company"
                  />
                  <p className="text-xs text-gray-500 -mt-2">
                    This will be your organization's URL: /{formData.organizationSlug || 'my-company'}
                  </p>
                </div>
              </div>

              <Button type="submit" loading={loading} className="w-full mt-6">
                Create Organization
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
