import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export default function ProtectedRoute({ children }) {
  const { currentUser } = useAuth()

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  return children
}