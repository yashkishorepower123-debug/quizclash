import { useEffect, useMemo, useState } from 'react';
import {
  Atom, BrainCircuit, Cpu, Trophy, Zap, Clock3, Users, Play,
  RotateCcw, Star, ChevronRight, Crown, Flame, Sparkles,
} from 'lucide-react';

type Category = 'Science' | 'Maths' | 'Technology';
type TopicFilter = 'All' | Category;
type Mode = 'solo' | 'duel';
type Question = {
  category: Category;
  q: string;
  options: string[];
  answer: number;
  fact: string;
};

const BANK: Question[] = [
  { category: 'Science', q: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Mercury'], answer: 1, fact: 'Iron-rich dust gives Mars its reddish appearance.' },
  { category: 'Maths', q: 'What is 12 × 8?', options: ['86', '92', '96', '108'], answer: 2, fact: '12 groups of 8 make 96.' },
  { category: 'Technology', q: 'What does CPU stand for?', options: ['Central Processing Unit', 'Computer Power Utility', 'Core Program User', 'Central Pixel Unit'], answer: 0, fact: 'The CPU executes instructions and coordinates computer operations.' },
  { category: 'Science', q: 'Which gas do plants absorb during photosynthesis?', options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'], answer: 2, fact: 'Plants use carbon dioxide, water, and light to make sugars.' },
  { category: 'Maths', q: 'What is the square root of 144?', options: ['10', '11', '12', '14'], answer: 2, fact: '12 × 12 = 144.' },
  { category: 'Technology', q: 'Which language adds structure to most web pages?', options: ['HTML', 'SQL', 'C++', 'Bash'], answer: 0, fact: 'HTML describes the structure and content of a web page.' },
  { category: 'Science', q: 'What is the closest star to Earth?', options: ['Sirius', 'The Sun', 'Polaris', 'Proxima Centauri'], answer: 1, fact: 'The Sun is our star; Proxima Centauri is the closest star beyond it.' },
  { category: 'Maths', q: 'A triangle has angles 60° and 70°. What is the third angle?', options: ['40°', '50°', '60°', '70°'], answer: 1, fact: 'The angles inside a triangle add up to 180°.' },
  { category: 'Technology', q: 'What does CSS primarily control on a website?', options: ['Database storage', 'Visual styling', 'Network routing', 'Machine code'], answer: 1, fact: 'CSS controls layout, colors, typography, and responsive presentation.' },
  { category: 'Science', q: 'What is the chemical symbol for gold?', options: ['Ag', 'Gd', 'Go', 'Au'], answer: 3, fact: 'Au comes from the Latin word aurum.' },
  { category: 'Maths', q: 'What is 15% of 200?', options: ['15', '20', '30', '35'], answer: 2, fact: '10% is 20 and 5% is 10, giving 30.' },
  { category: 'Technology', q: 'Which number system do computers fundamentally use?', options: ['Decimal', 'Binary', 'Roman', 'Hexadecimal only'], answer: 1, fact: 'Digital circuits represent information using two states, commonly 0 and 1.' },
  { category: 'Science', q: 'Which part of a cell contains most of its genetic material?', options: ['Nucleus', 'Cell wall', 'Ribosome', 'Membrane'], answer: 0, fact: 'In eukaryotic cells, most DNA is stored in the nucleus.' },
  { category: 'Maths', q: 'What is 7² + 3²?', options: ['49', '52', '58', '64'], answer: 2, fact: '49 + 9 = 58.' },
  { category: 'Technology', q: 'Which is a version-control tool?', options: ['Git', 'Figma', 'Vite', 'Chrome'], answer: 0, fact: 'Git tracks changes in files and supports collaborative development.' },
];

const iconFor = (category: Category) =>
  category === 'Science' ? Atom : category === 'Maths' ? BrainCircuit : Cpu;

function App() {
  const [screen, setScreen] = useState<'home' | 'game' | 'result'>('home');
  const [mode, setMode] = useState<Mode>('solo');
  const [category, setCategory] = useState<TopicFilter>('All');
  const [players, setPlayers] = useState(['Player 1', 'Player 2']);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [round, setRound] = useState(0);
  const [turn, setTurn] = useState(0);
  const [scores, setScores] = useState([0, 0]);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [bonus, setBonus] = useState(false);

  const current = questions[round] ?? BANK[0];
  const finished = round >= questions.length && questions.length > 0;
  const CIcon = iconFor(current.category);
  const activeScore = scores[turn];

  useEffect(() => {
    if (screen !== 'game' || locked || finished) return;
    if (timeLeft <= 0) {
      setLocked(true);
      setStreak(0);
      return;
    }
    const timer = window.setTimeout(() => setTimeLeft(value => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [screen, locked, finished, timeLeft]);

  useEffect(() => {
    if (screen === 'game' && finished) setScreen('result');
  }, [screen, finished]);

  const start = () => {
    const filtered = category === 'All' ? BANK : BANK.filter(q => q.category === category);
    const shuffled = [...filtered].sort(() => Math.random() - 0.5).slice(0, Math.min(8, filtered.length));
    setQuestions(shuffled);
    setRound(0);
    setTurn(0);
    setScores([0, 0]);
    setStreak(0);
    setBestStreak(0);
    setTimeLeft(15);
    setSelected(null);
    setLocked(false);
    setBonus(false);
    setScreen('game');
  };

  const choose = (index: number) => {
    if (locked) return;
    setSelected(index);
    setLocked(true);
    if (index === current.answer) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak(value => Math.max(value, newStreak));
      const points = (bonus ? 200 : 100) + timeLeft * 5 + (newStreak >= 3 ? 50 : 0);
      setScores(old => old.map((score, i) => i === turn ? score + points : score));
    } else {
      setStreak(0);
    }
  };

  const next = () => {
    if (round + 1 >= questions.length) {
      setRound(questions.length);
      setScreen('result');
      return;
    }
    setRound(value => value + 1);
    setTurn(mode === 'duel' ? 1 - turn : 0);
    setBonus((round + 1) % 4 === 0);
    setTimeLeft((round + 1) % 4 === 0 ? 20 : 15);
    setSelected(null);
    setLocked(false);
  };

  const totalScore = useMemo(() => scores.reduce((sum, value) => sum + value, 0), [scores]);
  const winnerName = scores[0] === scores[1]
    ? 'It’s a draw!'
    : (players[scores[0] > scores[1] ? 0 : 1].trim() || `Player ${scores[0] > scores[1] ? 1 : 2}`) + ' wins!';

  return (
    <div className="shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"><Zap size={21} fill="currentColor" /></div>
          <span>QUIZ<span className="brand-accent">CLASH</span></span>
        </div>
        <div className="top-right"><span className="live-dot" /><span>KNOWLEDGE ARENA</span><div className="avatar">Q</div></div>
      </header>

      {screen === 'home' && (
        <main className="home-layout">
          <section className="hero">
            <div className="eyebrow"><Sparkles size={14} /> THE ULTIMATE BRAIN BATTLE</div>
            <h1>Think fast.<br /><span>Clash harder.</span></h1>
            <p className="hero-copy">Your knowledge is your superpower. Race the clock, build combos, and own the arena.</p>
            <div className="hero-actions">
              <button className="primary-btn" onClick={start}><Play size={18} fill="currentColor" /> Start Battle <ChevronRight size={18} /></button>
              <div className="players-mini"><div className="mini-avatars"><span>⚡</span><span>🧠</span><span>🚀</span></div><div><b>Ready when you are</b><small>Solo or face a friend</small></div></div>
            </div>
            <div className="stats-row">
              <div><strong>8</strong><span>QUESTIONS / ROUND</span></div><div className="stat-divider" />
              <div><strong>15<span className="stat-unit">s</span></strong><span>PER QUESTION</span></div><div className="stat-divider" />
              <div><strong>×3</strong><span>COMBO BOOST</span></div>
            </div>
          </section>

          <section className="arena-card">
            <div className="arena-top"><span><span className="live-dot" /> ARENA PREVIEW</span><span className="season">SEASON 01</span></div>
            <div className="orb-scene">
              <div className="orbit orbit-a" /><div className="orbit orbit-b" /><div className="orbit orbit-c" />
              <div className="planet"><div className="planet-shine" /><div className="planet-crater crater-a" /><div className="planet-crater crater-b" /><div className="planet-crater crater-c" /></div>
              <div className="floating-chip chip-a"><Atom size={18} /><span>SCIENCE</span></div>
              <div className="floating-chip chip-b"><Cpu size={18} /><span>TECH</span></div>
              <div className="floating-chip chip-c"><BrainCircuit size={18} /><span>MATHS</span></div>
              <div className="spark spark-a">✦</div><div className="spark spark-b">✧</div><div className="spark spark-c">✦</div>
            </div>
            <div className="arena-bottom"><div><span className="muted-label">YOUR MISSION</span><h3>Claim the crown.</h3></div><div className="rank-badge"><Crown size={19} /><span>RANK<br /><b>ROOKIE</b></span></div></div>
          </section>

          <section className="mode-panel">
            <div className="section-heading"><div><span className="muted-label">CHOOSE YOUR BATTLE</span><h2>Set the arena</h2></div><span className="small-tag">01 / MODE</span></div>
            <div className="mode-grid">
              <button className={mode === 'solo' ? 'mode-card active' : 'mode-card'} onClick={() => setMode('solo')}><div className="mode-icon purple"><BrainCircuit size={23} /></div><div className="mode-text"><b>Solo run</b><span>Beat your high score</span></div><span className="radio-dot" /></button>
              <button className={mode === 'duel' ? 'mode-card active' : 'mode-card'} onClick={() => setMode('duel')}><div className="mode-icon orange"><Users size={23} /></div><div className="mode-text"><b>Local duel</b><span>Pass & play with a friend</span></div><span className="radio-dot" /></button>
            </div>
            {mode === 'duel' && <div className="player-inputs">
              <label>PLAYER 1<input value={players[0]} onChange={e => setPlayers(p => [e.target.value, p[1]])} maxLength={18} /></label>
              <label>PLAYER 2<input value={players[1]} onChange={e => setPlayers(p => [p[0], e.target.value])} maxLength={18} /></label>
            </div>}
            <div className="section-heading category-heading"><div><span className="muted-label">PICK YOUR SPECIALTY</span><h2>Battle topics</h2></div><span className="small-tag">02 / TOPIC</span></div>
            <div className="category-row">
              {(['All', 'Science', 'Maths', 'Technology'] as const).map(topic => (
                <button key={topic} className={category === topic ? 'category-pill chosen' : 'category-pill'} onClick={() => setCategory(topic)}>
                  {topic === 'All' ? <Sparkles size={16} /> : topic === 'Science' ? <Atom size={16} /> : topic === 'Maths' ? <BrainCircuit size={16} /> : <Cpu size={16} />} {topic}
                </button>
              ))}
            </div>
            <button className="launch-btn" onClick={start}><Zap size={18} fill="currentColor" /> Enter the arena <span>→</span></button>
          </section>

          <aside className="features">
            <div className="feature"><div className="feature-icon"><Clock3 size={19} /></div><div><b>Beat the clock</b><p>15 seconds to prove it.</p></div></div>
            <div className="feature"><div className="feature-icon"><Flame size={19} /></div><div><b>Combo streaks</b><p>Chain answers for bonus points.</p></div></div>
            <div className="feature"><div className="feature-icon"><Trophy size={19} /></div><div><b>Bonus rounds</b><p>Every fourth question hits different.</p></div></div>
          </aside>
        </main>
      )}

      {screen === 'game' && !finished && (
        <main className="game-layout">
          <div className="game-topline"><button className="back-btn" onClick={() => setScreen('home')}>← Exit arena</button><span className="round-label">ROUND {round + 1} <i>/ {questions.length}</i></span><span className="score-label"><Trophy size={16} /> {activeScore.toLocaleString()} PTS</span></div>
          <div className="progress-track"><div style={{ width: `${(round / questions.length) * 100}%` }} /></div>
          <div className="game-columns">
            <section className="question-panel">
              <div className="question-meta"><span className="topic-chip"><CIcon size={15} />{current.category.toUpperCase()}</span>{bonus && <span className="bonus-chip"><Star size={14} fill="currentColor" /> BONUS ROUND · 2×</span>}<span className={timeLeft <= 5 ? 'timer urgent' : 'timer'}><Clock3 size={17} />{timeLeft}s</span></div>
              <div className="question-number">QUESTION {(round + 1).toString().padStart(2, '0')}</div>
              <h1>{current.q}</h1><p className="question-hint">Choose the correct answer before time runs out.</p>
              <div className="answers">{current.options.map((option, index) => (
                <button disabled={locked} key={option} className={locked && index === current.answer ? 'answer correct' : locked && selected === index ? 'answer wrong' : 'answer'} onClick={() => choose(index)}>
                  <span className="answer-letter">{String.fromCharCode(65 + index)}</span><span>{option}</span>
                  {locked && index === current.answer && <span className="answer-status">✓</span>}
                  {locked && selected === index && index !== current.answer && <span className="answer-status">×</span>}
                </button>
              ))}</div>
              {locked ? <div className={selected === current.answer ? 'feedback good' : 'feedback'}><b>{selected === current.answer ? 'Correct! Nice work.' : selected === null ? 'Time is up!' : 'Not quite — keep going.'}</b><span>{current.fact}</span><button onClick={next}>Next question <ChevronRight size={16} /></button></div> : <div className="question-foot"><span><Zap size={15} /> Speed bonus: up to 75 pts</span><span>STREAK <b>{streak}</b></span></div>}
            </section>
            <aside className="scoreboard">
              <div className="scoreboard-head"><span className="muted-label">LIVE SCOREBOARD</span><Trophy size={18} /></div>
              {(mode === 'duel' ? [0, 1] : [0]).map(i => <div key={i} className={turn === i ? 'player-score current-player' : 'player-score'}><div className="player-symbol">{i === 0 ? '⚡' : '🧠'}</div><div className="player-data"><b>{mode === 'duel' ? players[i].trim() || `Player ${i + 1}` : 'You'}</b><small>{turn === i ? 'YOUR TURN' : 'WAITING'}</small></div><strong>{scores[i].toLocaleString()}</strong></div>)}
              <div className="streak-box"><Flame size={21} /><div><b>{streak}× combo</b><span>Current streak</span></div><div className="streak-meter">{[1, 2, 3, 4, 5].map(n => <i key={n} className={streak >= n ? 'lit' : ''} />)}</div></div>
              <div className="arena-tip"><Sparkles size={17} /><div><b>Clash tip</b><p>Answer quickly and keep your streak alive for extra points.</p></div></div>
            </aside>
          </div>
        </main>
      )}

      {screen === 'result' && (
        <main className="result-layout">
          <div className="result-orb"><Trophy size={48} /><div className="result-ring" /></div>
          <div className="eyebrow"><Sparkles size={14} /> BATTLE COMPLETE</div>
          <h1>{mode === 'duel' ? winnerName : 'Look at you, brainiac.'}</h1>
          <p className="result-copy">Every round makes you sharper. Ready for a rematch?</p>
          <div className="result-stats"><div><span>{mode === 'duel' ? 'WINNING SCORE' : 'YOUR SCORE'}</span><b>{(mode === 'duel' ? Math.max(...scores) : scores[0]).toLocaleString()}</b></div><div><span>QUESTIONS</span><b>{questions.length} / {questions.length}</b></div><div><span>BEST COMBO</span><b>{bestStreak}×</b></div></div>
          {mode === 'duel' && <div className="final-scores">{players.map((name, i) => <div key={i}><span>{name.trim() || `Player ${i + 1}`}</span><b>{scores[i].toLocaleString()} pts</b></div>)}</div>}
          <div className="result-actions"><button className="primary-btn" onClick={start}><RotateCcw size={18} /> Play again</button><button className="secondary-btn" onClick={() => setScreen('home')}>Back to home</button></div>
          <span className="sr-only">Total score earned: {totalScore}</span>
        </main>
      )}

      <footer className="footer"><span>© QUIZ CLASH <i>·</i> THINK FAST. PLAY FAIR.</span><span><span className="live-dot" /> YOUR NEXT BIG BRAIN MOMENT AWAITS</span></footer>
    </div>
  );
}

export default App;
