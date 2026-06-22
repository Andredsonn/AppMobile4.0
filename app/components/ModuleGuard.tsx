import { Card } from './ui/card';
import { Layout } from './Layout';
import { useAuth } from '../../context/AuthContext';
import { canManageModule, type PermissionModule } from '../../utils/permissions';

interface ModuleGuardProps {
  module: PermissionModule;
  children: React.ReactNode;
}

export function ModuleGuard({ module, children }: ModuleGuardProps) {
  const { user } = useAuth();

  if (!canManageModule(user, module)) {
    return (
      <Layout>
        <Card className="p-8 text-center">
          <p className="text-gray-600">Voce tem permissao apenas para visualizar este modulo.</p>
        </Card>
      </Layout>
    );
  }

  return <>{children}</>;
}
