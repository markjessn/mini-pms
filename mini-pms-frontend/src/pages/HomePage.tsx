import { useQuery, useMutation } from '@apollo/client';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GET_ORGANIZATIONS, CREATE_ORGANIZATION } from '../graphql/operations';
import { Organization, OrganizationInput } from '../types';
import { Button, Card, CardBody, Modal, Input, LoadingOverlay, EmptyState } from '../components/ui';

export function HomePage() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<OrganizationInput>({
    name: '',
    slug: '',
    contactEmail: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, loading, refetch } = useQuery(GET_ORGANIZATIONS);
  const [createOrganization, { loading: creating }] = useMutation(CREATE_ORGANIZATION);

  const organizations: Organization[] = data?.organizations || [];

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Invalid email';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const { data } = await createOrganization({
        variables: { input: formData },
      });
      if (data?.createOrganization?.success) {
        setIsModalOpen(false);
        setFormData({ name: '', slug: '', contactEmail: '' });
        refetch();
        navigate(`/${data.createOrganization.organization.slug}`);
      }
    } catch (error) {
      console.error('Error creating organization:', error);
    }
  };

  if (loading) return <LoadingOverlay />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Mini PMS</h1>
          <p className="text-lg text-gray-600">
            A simple project management system
          </p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Organizations</h2>
          <Button onClick={() => setIsModalOpen(true)}>New Organization</Button>
        </div>

        {organizations.length === 0 ? (
          <EmptyState
            title="No organizations yet"
            description="Create your first organization to get started."
            action={<Button onClick={() => setIsModalOpen(true)}>Create Organization</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {organizations.map((org) => (
              <Card
                key={org.id}
                hoverable
                onClick={() => navigate(`/${org.slug}`)}
              >
                <CardBody>
                  <h3 className="text-lg font-semibold text-gray-900">{org.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{org.contactEmail}</p>
                  <p className="text-sm text-gray-400 mt-2">
                    {org.projectCount || 0} projects
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create Organization"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Organization Name"
              value={formData.name}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  name: e.target.value,
                  slug: generateSlug(e.target.value),
                });
              }}
              error={errors.name}
              placeholder="My Organization"
            />
            <Input
              label="Slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              error={errors.slug}
              placeholder="my-organization"
            />
            <Input
              label="Contact Email"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              error={errors.contactEmail}
              placeholder="contact@example.com"
            />
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={creating}>
                Create
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
