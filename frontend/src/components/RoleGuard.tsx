import { useAuth } from "@/context/authContext";

export const RoleGuard = ({
  children,
  allowedRoles,
  fallback = <div>Unauthorized access</div>,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
  fallback?: React.ReactNode;
}) => {
  const { role, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!role || !allowedRoles.includes(role)) return fallback;

  return <>{children}</>;
};
