// Uncomment this line to use CSS modules
// import styles from './app.module.css';
import { CanvasContainer } from '../components/CanvasContainer';
import NxWelcome from './nx-welcome';
import { boxScene, emptyScene, GameScene } from '@org/game-engine';

const gameLevelsManifest: GameScene[] = [
  boxScene, 
  emptyScene
]

export function App() {
  return (
    <div>
      <NxWelcome title="@org/frontend" />
      <CanvasContainer scenes={gameLevelsManifest}/>
    </div>
  );
}

export default App;
