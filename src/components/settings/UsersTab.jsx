import EmptyState from '../common/EmptyState.jsx'
import ErrorState from '../common/ErrorState.jsx'
import LoadingSkeleton from '../common/LoadingSkeleton.jsx'
import { ROLE_LABELS } from '../../constants/settings.js'
import { useUsers } from '../../hooks/useUsers.js'

/** Admin-only roster of console users and their roles. */
function UsersTab() {
  const query = useUsers()
  const users = query.data?.data ?? []

  if (query.isLoading) return <LoadingSkeleton rows={4} />
  if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} />
  if (users.length === 0) {
    return <EmptyState title="No users" description="No console users are registered." />
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
            <th scope="col" className="py-2 pr-3 font-medium">Name</th>
            <th scope="col" className="py-2 pr-3 font-medium">Email</th>
            <th scope="col" className="py-2 font-medium">Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.email} className="border-b border-border last:border-0">
              <td className="py-2 pr-3 text-text">{user.name}</td>
              <td className="py-2 pr-3 font-mono text-xs text-muted">{user.email}</td>
              <td className="py-2 text-text">{ROLE_LABELS[user.role] ?? user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default UsersTab
