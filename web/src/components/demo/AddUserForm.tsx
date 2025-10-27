import { useState } from 'react';
import { UserPlus, Check, AlertCircle } from 'lucide-react';

export interface User {
  _id: string;
  email: string;
  name: string;
  displayName: string;
  role: 'platform_owner' | 'org_owner' | 'org_user' | 'customer';
}

interface AddUserFormProps {
  initialUsers: User[];
  onUsersChange: (users: User[]) => void;
  groupId: string;
}

export function AddUserForm({ initialUsers, onUsersChange, groupId }: AddUserFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [users, setUsers] = useState(initialUsers);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'org_user' as const,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Call backend HTTP API to create person
      const response = await fetch('https://veracious-marlin-319.convex.cloud/http/people', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId,
          name: formData.name,
          email: formData.email,
          role: formData.role,
          properties: {
            displayName: formData.name,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create person');
      }

      const result = await response.json();

      const newUser: User = {
        _id: result.data._id,
        email: formData.email,
        name: formData.name,
        displayName: formData.name,
        role: formData.role,
      };

      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      onUsersChange(updatedUsers);

      setMessage({ type: 'success', text: 'User added successfully!' });
      setFormData({ email: '', name: '', role: 'org_user' });

      setTimeout(() => {
        setIsOpen(false);
        setMessage(null);
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add user. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold mb-6"
      >
        <UserPlus className="w-4 h-4" />
        Add New User
      </button>
    );
  }

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
      <h3 className="font-bold text-slate-900 mb-4">Add New User</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="user@example.com"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Role
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="customer">Customer</option>
            <option value="org_user">Org User</option>
            <option value="org_owner">Org Owner</option>
            <option value="platform_owner">Platform Owner</option>
          </select>
        </div>

        {message && (
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {message.type === 'success' ? (
              <Check className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Adding...' : 'Add User'}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex-1 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition font-semibold"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
