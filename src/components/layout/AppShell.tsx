import { Outlet, NavLink } from 'react-router-dom';
import { Button, Flex, Heading, Text } from '@aws-amplify/ui-react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { CASE_STATUSES } from '../../lib/domain';
import { StatusBadge } from '../ui/StatusBadge';

const navigation = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/patients', label: 'Pacientes' },
  { to: '/patients/new', label: 'Novo paciente' },
  { to: '/cases', label: 'Casos' },
  { to: '/cases/new', label: 'Novo caso' },
];

export function AppShell() {
  const { signOut, user } = useAuthenticator((context) => [context.user]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <Text className="brand__eyebrow">Fluxo</Text>
          <Heading level={4}>Alinhadores</Heading>
        </div>

        <nav className="nav">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav__link${isActive ? ' nav__link--active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__summary">
          <Text className="muted">Fluxo produtivo</Text>
          <Flex wrap="wrap" gap="0.5rem">
            {CASE_STATUSES.slice(0, 3).map((status) => (
              <StatusBadge key={status} status={status} />
            ))}
          </Flex>
        </div>
      </aside>

      <div className="app-shell__content">
        <header className="topbar">
          <div>
            <Text className="muted">Usuário autenticado</Text>
            <Heading level={5}>{user?.signInDetails?.loginId ?? user?.username ?? 'Usuário'}</Heading>
          </div>
          <Button variation="primary" onClick={signOut}>
            Sair
          </Button>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
