import { useState } from 'react';
import { Users, User } from 'lucide-react';
import { AddUserForm, type User as UserType } from './AddUserForm';

interface PeopleDemoProps {
  initialPeople: UserType[];
  currentPerson: UserType | null;
  isStandaloneMode: boolean;
  groupId?: string;
}

export function PeopleDemo({ initialPeople, currentPerson, isStandaloneMode, groupId }: PeopleDemoProps) {
  const [people, setPeople] = useState(initialPeople);

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-slate-700" />
          <h2 className="text-2xl font-bold text-slate-900">Live Data</h2>
        </div>
        {isStandaloneMode ? (
          <span className="text-xs font-semibold bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
            Demo Data (Standalone Mode)
          </span>
        ) : (
          <span className="text-xs font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full">
            Connected to Backend
          </span>
        )}
      </div>

      {!isStandaloneMode && groupId && (
        <AddUserForm initialUsers={people} onUsersChange={setPeople} groupId={groupId} />
      )}

      {currentPerson && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-slate-700" />
            <h3 className="font-bold text-slate-900">Current User</h3>
          </div>
          <div className="bg-blue-50 rounded p-4">
            <p className="font-semibold">{currentPerson.displayName || currentPerson.name}</p>
            <p className="text-sm text-slate-600">
              {currentPerson.email} • <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                {currentPerson.role}
              </span>
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-slate-700" />
        <h3 className="font-bold text-slate-900">All Users ({people.length})</h3>
      </div>

      {people.length > 0 ? (
        <div className="space-y-2">
          {people.map((p) => (
            <div key={p._id} className="bg-slate-50 rounded p-3 hover:bg-slate-100 transition">
              <p className="font-semibold text-slate-900">{p.displayName || p.name}</p>
              <p className="text-sm text-slate-600">
                {p.email} •{' '}
                <span
                  className={`text-xs px-2 py-1 rounded font-semibold ${
                    p.role === 'platform_owner'
                      ? 'bg-red-100 text-red-700'
                      : p.role === 'org_owner'
                        ? 'bg-orange-100 text-orange-700'
                        : p.role === 'org_user'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                  }`}
                >
                  {p.role}
                </span>
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-100 rounded p-4 text-center text-slate-600">
          No user data available
        </div>
      )}
    </div>
  );
}
