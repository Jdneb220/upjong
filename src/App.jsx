import React, { useState, useEffect, useRef } from 'react'
import './App.css'
import womp from './assets/womp.mp3';
import coin from './assets/coin.mp3';
import { Tile, TILES } from './Tile'
import Leaderboard from './Leaderboard';

let myCurrentTile = null;
let myPrevTile = null;

function getShuffledWall() {
  // Create 4 copies of each tile
  const wall = [];
  for (let i = 0; i < 4; i++) {
    wall.push(...TILES);
  }
  // Shuffle using Fisher-Yates
  for (let i = wall.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [wall[i], wall[j]] = [wall[j], wall[i]];
  }
  return wall;
}

function App(props) {
  const wompRef = useRef(new Audio(womp));
  const coinRef = useRef(new Audio(coin));
  const [audio, setAudio] = useState(true);
  const [prevTile, setPrevTile] = useState(null);
  const [tileClass, setTileClass] = useState("");
  const tileClassTimeout = React.useRef();
  // Probability calculation helpers
  function getProb(type) {
    if (!currentTile || wall.length < 2) return null;
    // If currentTile is wind/dragon, use last non-wind/dragon tile in history
    let prevNum, prevSuit;
    const idx = TILES.indexOf(currentTile);
    if (idx >= 27) {
      // wind/dragon: search history backwards for last number tile
      for (let i = history.length - 1; i >= 0; i--) {
        const n = getTileNumber(history[i]);
        if (n !== null) {
          prevNum = n;
          prevSuit = getTileSuit(history[i]);
          break;
        }
      }
      // fallback: if not found, return null
      if (prevNum === undefined) return null;
    } else {
      prevNum = getTileNumber(currentTile);
      prevSuit = getTileSuit(currentTile);
    }
    let count = 0;
    let total = 0;
    for (let i = 0; i < wall.length - 1; i++) { // exclude currentTile
      const tile = wall[i];
      const num = getTileNumber(tile);
      const suit = getTileSuit(tile);
      if (num === null) continue; // skip winds/dragons
      total++;
      if (type === 'lower' && num < prevNum) count++;
      if (type === 'higher' && num > prevNum) count++;
      if (type === 'lowerSameSuit' && num < prevNum && suit === prevSuit) count++;
      if (type === 'lowerDiffSuit' && num < prevNum && suit !== prevSuit) count++;
      if (type === 'higherSameSuit' && num > prevNum && suit === prevSuit) count++;
      if (type === 'higherDiffSuit' && num > prevNum && suit !== prevSuit) count++;
    }
    if (total === 0) return null;
    return (count / total * 100).toFixed(1) + '%';
  }
  // Helper to get suit of a tile
  function getTileSuit(tile) {
    const idx = TILES.indexOf(tile);
    if (idx >= 0 && idx < 9) return 'pin';
    if (idx >= 9 && idx < 18) return 'man';
    if (idx >= 18 && idx < 27) return 'sou';
    if (idx >= 27 && idx <= 29) return 'dragon';
    if (idx >= 30 && idx <= 33) return 'wind';
    return 'other';
  }
  const [multiplier, setMultiplier] = useState(1);

  const [count, setCount] = useState(0)
  const [wall, setWall] = useState(() => getShuffledWall());
  const [currentTile, setCurrentTile] = useState(() => null);
  const [guess, setGuess] = useState(null); // 'lower' or 'higher'
  const [history, setHistory] = useState([]); // stores previous currentTiles

  // On mount, set the initial currentTile
  useEffect(() => {
    if (currentTile === null && wall.length > 0) {
      let i = 0;
      // Find the first non-wind/dragon tile in the wall
      while (i < wall.length && (TILES.indexOf(wall[i]) >= 27)) {
        i++;
      }
      
      
      setCurrentTile(wall[i]);
      myCurrentTile = wall[i];
      
      // Initialize prevTile to the same as currentTile
      //setWall(wall.splice(i, 1)); // remove the used tile
    }
  }, [wall, currentTile, prevTile]);

  // Helper to get tile number for comparison (1-9 for man/pin/sou, null for others)
  function getTileNumber(tile) {
    const idx = TILES.indexOf(tile);
    if (idx >= 0 && idx < 9) return idx + 1; // pin
    if (idx >= 9 && idx < 18) return idx - 8; // man
    if (idx >= 18 && idx < 27) return idx - 17; // sou
    return null;
  }

  function handleGuess(type, value) {
    if (TILES.indexOf(myCurrentTile) < 27) {
      
      myPrevTile = myCurrentTile; // If currentTile is wind/dragon, keep prevTile as is
      
    }

    // Remove any previous animation class
    if (tileClassTimeout.current) clearTimeout(tileClassTimeout.current);
    // type can be: 'lower', 'higher', 'lowerSameSuit', 'lowerDiffSuit', 'higherDiffSuit', 'higherSameSuit'
    setGuess(type);
    if (wall.length < 2) return; // not enough tiles to draw
    // Use prevTile from state for number tile comparisons
    
    // pop a tile from the wall
    const newWall = wall.slice(0, -1);
    const nextTile = newWall[newWall.length - 1];
    setWall(newWall);
    // Only update prevTile if nextTile is not wind/dragon
    const idx = TILES.indexOf(nextTile);
    const isWindOrDragon = idx >= 27;
    if (!isWindOrDragon) {
      setPrevTile(currentTile);
    }
    setCurrentTile(nextTile);
    myCurrentTile = nextTile;
    setHistory(h => [...h, currentTile]);
    // Check if nextTile is wind or dragon
    const nextNum = getTileNumber(nextTile);
    const nextSuit = getTileSuit(nextTile);
    let newClass = "";
    let delta = 0;
    if (isWindOrDragon) {
      newClass = "animate__animated animate__flash";
      setTileClass(newClass);
      tileClassTimeout.current = setTimeout(() => setTileClass(""), 1200);
      setMultiplier(m => m * 2);
      // Do not update count or prevTile, just return
      return;
    }
    if (count <= 10)
      setMultiplier(1); // reset multiplier for number tiles

    const compareNum = getTileNumber(myPrevTile);
    const compareSuit = getTileSuit(myPrevTile);

    

    let correct = false;
    if (compareNum !== null && nextNum !== null) {
      if (type === 'lower' && nextNum < compareNum) correct = true;
      if (type === 'higher' && nextNum > compareNum) correct = true;
      if (type === 'lowerSameSuit' && nextNum < compareNum && nextSuit === compareSuit) correct = true;
      if (type === 'lowerDiffSuit' && nextNum < compareNum && nextSuit !== compareSuit) correct = true;
      if (type === 'higherSameSuit' && nextNum > compareNum && nextSuit === compareSuit) correct = true;
      if (type === 'higherDiffSuit' && nextNum > compareNum && nextSuit !== compareSuit) correct = true;
      delta = value * multiplier;
      if (!correct) delta = -delta;
      // Animation class assignment based on delta
      if (delta >= 100) newClass = "animate__animated animate__heartBeat";
      else if (delta >= 25) newClass = "animate__animated animate__rubberBand";
      else if (delta >= 10) newClass = "animate__animated animate__tada";
      else if (delta >= 1) newClass = "animate__animated animate__bounce";
      else if (delta <= -50) newClass = "animate__animated animate__wobble";
      else if (delta <= -16) newClass = "animate__animated animate__jello";
      else if (delta <= -3) newClass = "animate__animated animate__shakeX";
      else if (delta <= -1) newClass = "animate__animated animate__headShake";
      setTileClass(newClass);
      tileClassTimeout.current = setTimeout(() => setTileClass(""), 1200);
      if (correct) {
        if (audio)
          coinRef.current.play();
        setCount(c => c + value * multiplier);
      } else {
        if (audio) {
          wompRef.current.playbackRate = 1.5;
          wompRef.current.currentTime = 0.4; // Reset to start
          wompRef.current.play();
        }
        setCount(c => { if (c - value * multiplier < 10) { setMultiplier(1); } return c - value * multiplier;});
      }
    } else {
      // If either tile is not a number tile, treat as incorrect
      setTileClass("animate__animated animate__headShake");
      tileClassTimeout.current = setTimeout(() => setTileClass(""), 1200);
      setCount(c => c - 1 * multiplier);
    }
  }

  // Helper to get tile number for sorting (nulls last)
  function getTileSortValue(tile) {
    const idx = TILES.indexOf(tile);
    if (idx >= 0 && idx < 9) return idx + 1; // pin
    if (idx >= 9 && idx < 18) return idx - 8 + 10; // man (10-18)
    if (idx >= 18 && idx < 27) return idx - 17 + 20; // sou (20-28)
    return 100 + idx; // others, keep order but after number tiles
  }

  const sortedHistory = [...history].sort((a, b) => getTileSortValue(a) - getTileSortValue(b));

  // Find the last non-wind/dragon tile in history (or currentTile if it's not wind/dragon)
  const isWindOrDragon = currentTile ? TILES.indexOf(currentTile) >= 27 : false;
  let lastNonWindDragonTile = null;
  if (isWindOrDragon) {
    // Search history backwards for the last non-wind/dragon tile
    for (let i = history.length - 1; i >= 0; i--) {
      const idx = TILES.indexOf(history[i]);
      if (idx >= 0 && idx < 27) {
        lastNonWindDragonTile = history[i];
        break;
      }
    }
    // If not found in history, check currentTile (shouldn't happen, but fallback)
    if (!lastNonWindDragonTile && currentTile && TILES.indexOf(currentTile) < 27) {
      lastNonWindDragonTile = currentTile;
    }
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <div style={{ fontFamily: 'Sedgwick Ave Display', fontWeight: 'bold', fontSize: '2rem' }}>{wall.length <= 1 ? 'Final': ''} Score: {count}</div>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', minHeight: '100px' }}>
          {isWindOrDragon && lastNonWindDragonTile && (
            <Tile tile={lastNonWindDragonTile} size="full" />
          )}
          {currentTile && (
            <Tile
              tile={currentTile}
              size="full"
              className={tileClass}
              style={
                isWindOrDragon && lastNonWindDragonTile
                  ? { marginLeft: 16, marginTop: 0, marginRight: 0, marginBottom: 0 }
                  : { marginTop: 0, marginRight: 0, marginBottom: 0, marginLeft: 0 }
              }
            />
          )}
        </div>
        {wall.length <= 1 && (
          <Leaderboard data={props.data} score={count}/>
        )}
        <div style={wall.length <= 1 ? { display: 'none' } : {}}>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button onClick={() => handleGuess('lower', 1)}>{`⬇️ (+${multiplier})`}</button>
            <span style={{ fontSize: '0.9rem' }}>P: {getProb('lower') ?? '--'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button onClick={() => handleGuess('higher', 1)}>{`⬆️ (+${multiplier})`}</button>
            <span style={{ fontSize: '0.9rem' }}>P: {getProb('higher') ?? '--'}</span>
          </div>
        </div>
        <div style={count < 10 ? { display: 'none' } : {}}>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button onClick={() => handleGuess('lowerSameSuit', 5)}>{`⬇️ Same (+${5 * multiplier})`}</button>
            <span style={{ fontSize: '0.9rem' }}>P: {getProb('lowerSameSuit') ?? '--'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button onClick={() => handleGuess('lowerDiffSuit', 3)}>{`⬇️ Diff (+${3 * multiplier})`}</button>
            <span style={{ fontSize: '0.9rem' }}>P: {getProb('lowerDiffSuit') ?? '--'}</span>
          </div>
          </div><div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button onClick={() => handleGuess('higherDiffSuit', 3)}>{`⬆️ Diff (+${3 * multiplier})`}</button>
            <span style={{ fontSize: '0.9rem' }}>P: {getProb('higherDiffSuit') ?? '--'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button onClick={() => handleGuess('higherSameSuit', 5)}>{`⬆️ Same (+${5 * multiplier})`}</button>
            <span style={{ fontSize: '0.9rem' }}>P: {getProb('higherSameSuit') ?? '--'}</span>
          </div>
          </div>
        </div>
        </div>
        </div>
        <div style={{ margin: '0.5rem .75rem', fontSize: '2rem', position: ' absolute', bottom: '0', left: '0' }}>
          <span
            style={ audio ? { cursor: 'not-allowed' } : { cursor: 'pointer' }}
            onClick={() => setAudio(!audio)}
          >
            {audio ? '🔊' : '🔈'}
          </span>
        </div>
        <div style={{ margin: '0.5rem .75rem',  fontSize: '2rem', position: ' absolute', bottom: '0', right: '0' }}>
          <span
            style={multiplier === 1 ? {color: 'gray'} : { cursor: 'not-allowed' }}
            onClick={() => setMultiplier(1)}
            disabled={multiplier === 1}
          >
            {`x${multiplier}`}
          </span>
        </div>
        <div style={{ marginTop: '1rem', display: 'none', flexDirection: 'row', gap: '0.25rem', flexWrap: 'wrap', justifyContent: 'center', minHeight: '40px' }}>
          {sortedHistory.map((tile, idx) => tile && (
            <Tile key={idx} tile={tile} size="half" />
          ))}
        </div>
      </div>
    </>
  )
}

export default App
