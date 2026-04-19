import { useState, useCallback } from 'react';
import type { AppPhase, HubState } from './types';
import { DEFAULT_ACCESS_CODE, ADMIN_CODE } from './types';
import AccessTerminal from './sections/AccessTerminal';
import RiverJourney from './sections/RiverJourney';
import HarborGate from './sections/HarborGate';
import TheHub from './sections/TheHub';

function App() {
  const [phase, setPhase] = useState<AppPhase>('terminal');
  const [isAdmin, setIsAdmin] = useState(false);
  const [hubState, setHubState] = useState<HubState>({
    codename: '',
    isAdmin: false,
    messages: [],
    files: [],
    onlineUsers: [],
    sosActive: false,
  });

  const handleAccessGranted = useCallback((code: string) => {
    const isAdminCode = code === ADMIN_CODE;
    setIsAdmin(isAdminCode);
    setPhase('river');
  }, []);

  const handleRiverComplete = useCallback(() => {
    setPhase('gate');
  }, []);

  const handleCodenameSet = useCallback((codename: string) => {
    setHubState(prev => ({
      ...prev,
      codename,
      isAdmin,
    }));
    setPhase('hub');
  }, [isAdmin]);

  const handleUpdateHubState = useCallback((updates: Partial<HubState>) => {
    setHubState(prev => ({ ...prev, ...updates }));
  }, []);

  return (
    <div className="min-h-screen bg-void text-[#E0E0E0] overflow-hidden">
      {phase === 'terminal' && (
        <AccessTerminal
          onAccessGranted={handleAccessGranted}
          defaultCode={DEFAULT_ACCESS_CODE}
          adminCode={ADMIN_CODE}
        />
      )}

      {phase === 'river' && (
        <RiverJourney onComplete={handleRiverComplete} />
      )}

      {phase === 'gate' && (
        <HarborGate
          onCodenameSet={handleCodenameSet}
          isAdmin={isAdmin}
        />
      )}

      {phase === 'hub' && (
        <TheHub
          hubState={hubState}
          onUpdateHubState={handleUpdateHubState}
        />
      )}
    </div>
  );
}

export default App;
