import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useParams, Navigate } from 'react-router-dom';
import { GET_ORG_MEMBERS, CREATE_ORG_MEMBER, DELETE_ORG_MEMBER, GET_ORGANIZATION } from '../graphql/operations';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/layout';
import { Button, Card, CardBody, Modal, Input, LoadingOverlay, EmptyState } from '../components/ui';
import type { User, Organization } from '../types';

export function MembersPage() {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const { user: currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');

  const { data: orgData } = useQuery<{ organization: Organization }>(GET_ORGANIZATION, {
    variables: { slug: orgSlug },
    skip: !orgSlug,
  });

  const organizationId = orgData?.organization?.id;

  const { data, loading, refetch } = useQuery<{ orgMembers: User[] }>(GET_ORG_MEMBERS, {
    variables: { organizationId },
    skip: !organizationId,
  });

  const [createMember, { loading: creating }] = useMutation(CREATE_ORG_MEMBER);
  const [deleteMember] = useMutation(DELETE_ORG_MEMBER);

  const members = data?.orgMembers || [];

  // Only org admins can access this page
  if (!currentUser?.isOrgAdmin) {
    return <Navigate to={`/${orgSlug}`} replace />;
  }

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    try {
      const { data } = await createMember({
        variables: {
          input: {
            name: formData.name,
            email: formData.email,
            password: formData.password,
          },
          organizationId,
        },
      });

      if (data?.createOrgMember?.success) {
        setIsModalOpen(false);
        setFormData({ name: '', email: '', password: '' });
        refetch();
      } else if (data?.createOrgMember?.errors?.length) {
        setServerError(data.createOrgMember.errors.join(', '));
      }
    } catch (err) {
      setServerError('An error occurred. Please try again.');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      const { data } = await deleteMember({
        variables: { userId },
      });

      if (data?.deleteOrgMember?.success) {
        refetch();
      }
    } catch (err) {
      console.error('Error deleting member:', err);
    }
  };

  if (loading) return <LoadingOverlay />;

  return (
    <Layout orgSlug={orgSlug!}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
            <p className="text-gray-600">Manage your organization's team members</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>Add Member</Button>
        </div>

        {members.length === 0 ? (
          <EmptyState
            title="No team members yet"
            description="Add your first team member to get started."
            action={<Button onClick={() => setIsModalOpen(true)}>Add Member</Button>}
          />
        ) : (
          <div className="space-y-4">
            {members.map((member) => (
              <Card key={member.id}>
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-500">{member.email}</p>
                      <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                        member.isOrgAdmin
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {member.isOrgAdmin ? 'Admin' : 'Member'}
                      </span>
                    </div>
                    {!member.isOrgAdmin && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDelete(member.id)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add Team Member"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {serverError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {serverError}
              </div>
            )}

            <Input
              label="Name"
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
              placeholder="john@example.com"
            />

            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
              placeholder="At least 6 characters"
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={creating}>
                Add Member
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}
