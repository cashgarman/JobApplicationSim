import { useGameStore } from './store/gameStore';
import { Layout } from './components/Layout';
import { StartScreen } from './components/StartScreen';
import { GameOverScreen } from './components/GameOverScreen';

function App()
{
  const phase = useGameStore((s) => s.state.phase);
  const sessionId = useGameStore((s) => s.sessionId);

  if (phase === 'start')
  {
    return <StartScreen key={sessionId} />;
  }

  if (phase === 'gameOver')
  {
    return <GameOverScreen key={sessionId} />;
  }

  return <Layout key={sessionId} />;
}

export default App;
