import { Badge } from './ui/badge';

interface StatusBadgeProps {
  status: 'RECEITA' | 'DESPESA' | 'PENDENTE' | 'PAGO' | 'ATIVO' | 'INATIVO';
  children?: React.ReactNode;
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
  const variants = {
    RECEITA: 'bg-green-100 text-green-800 hover:bg-green-100',
    DESPESA: 'bg-red-100 text-red-800 hover:bg-red-100',
    PENDENTE: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
    PAGO: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    ATIVO: 'bg-green-100 text-green-800 hover:bg-green-100',
    INATIVO: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
  };

  return (
    <Badge className={variants[status]}>
      {children || status}
    </Badge>
  );
}
