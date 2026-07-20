import { useGameStore } from './store/gameStore';
import { Layout } from './components/Layout';
import { StartScreen } from './components/StartScreen';
import { GameOverScreen } from './components/GameOverScreen';

function App()
{
  const phase = useGameStore((s) => s.state.phase);

  if (phase === 'start')
  {
    return <StartScreen />;
  }

  if (phase === 'gameOver')
  {
    return <GameOverScreen />;
  }

  return <Layout />;
}

export default App;
