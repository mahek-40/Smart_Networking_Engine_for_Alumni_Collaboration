import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NetworkProvider } from './contexts/NetworkContext';
import { ProjectProvider } from './contexts/ProjectContext';
import AppRouter from './routes/AppRouter';

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <NetworkProvider>
        <ProjectProvider>
          <AppRouter />
        </ProjectProvider>
      </NetworkProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
