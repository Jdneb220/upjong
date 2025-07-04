import React from 'react';
import tileMap from './assets/tile_map.jpg';

export const TILES = [
  // Pin (row 0)
  '🀙', '🀚', '🀛', '🀜', '🀝', '🀞', '🀟', '🀠', '🀡',
  // Man (row 1)
  '🀇', '🀈', '🀉', '🀊', '🀋', '🀌', '🀍', '🀎', '🀏',
  // Sou (row 2)
  '🀐', '🀑', '🀒', '🀓', '🀔', '🀕', '🀖', '🀗', '🀘',
  // Dragons & Winds (row 4)
  '🀄', '🀅', '🀆', '🀀', '🀁', '🀂', '🀃',
];

export const SUITS = {
  pin:'🎱',man:'🈳',sou:'🎍'
}

const tileWidth = 69;
const tileHeight = 91;

function getTileSpritePosition(tile) {
  // Pin
  const pinIndex = TILES.slice(0, 9).indexOf(tile);
  if (pinIndex !== -1) return { row: 0, col: pinIndex, suit: 'pin' };
  // Man
  const manIndex = TILES.slice(9, 18).indexOf(tile);
  if (manIndex !== -1) return { row: 1, col: manIndex, suit: 'man' };
  // Sou
  const souIndex = TILES.slice(18, 27).indexOf(tile);
  if (souIndex !== -1) return { row: 2, col: souIndex, suit: 'sou' };
  // Dragons & Winds (row 4)
  const dwIndex = TILES.slice(27).indexOf(tile);
  if (dwIndex !== -1) {
    let suit = 'other';
    if (dwIndex <= 2) suit = 'dragon';
    else suit = 'wind';
    return { row: 4, col: dwIndex, suit };
  }
  return { row: 0, col: 0, suit: 'other' }; // fallback
}

export const Tile = ({
  tile,
  size = 'full',
  borderColor,
  number,
  label,
  selected = false,
  onClick,
  style = {},
  className = "",
}) => {
  const { row, col, suit } = getTileSpritePosition(tile);

  let computedBorderColor = borderColor;
  let computedNumber = number;
  let computedLabel = label;

  if (!borderColor) {
    if (suit === 'man') {
      computedBorderColor = 'red';
      computedNumber = col + 1;
    } else if (suit === 'pin') {
      computedBorderColor = 'blue';
      computedNumber = col + 1;
    } else if (suit === 'sou') {
      computedBorderColor = 'green';
      computedNumber = col + 1;
    } else if (suit === 'dragon') {
      computedBorderColor = 'gold';
      if (col === 0) computedLabel = 'R';
      else if (col === 1) computedLabel = 'G';
      else if (col === 2) computedLabel = 'W';
    } else if (suit === 'wind') {
      computedBorderColor = 'purple';
      if (col === 3) computedLabel = 'E';
      else if (col === 4) computedLabel = 'S';
      else if (col === 5) computedLabel = 'W';
      else if (col === 6) computedLabel = 'N';
    } else {
      computedBorderColor = 'gray';
    }
  }

  const colOffsets = [0, 0, 0.5, 0.5, .75, 1, 1, 1, 1.4];
  const bgX = -(col * tileWidth) + colOffsets[col];
  const bgY = -(row * tileHeight);

  let width = tileWidth;
  let height = tileHeight;
  let border = selected ? `4px solid ${computedBorderColor}` : '4px solid white';
  let fontSize = '.9rem';
  let labelTop = 2;
  let labelRight = 2;
  let backgroundPosition = `${bgX}px ${bgY}px`;
  let backgroundSize = `612px 446px`;

  if (size === 'half') {
    width = tileWidth / 2;
    height = tileHeight / 2;
    border = '2px solid white';
    fontSize = '.45rem';
    labelTop = 1;
    labelRight = 1;
    backgroundPosition = `${bgX / 2}px ${bgY / 2}px`;
    backgroundSize = `306px 223px`;
  }

  return (
    <span
      onClick={onClick}
      className={className}
      style={{
        position: 'relative',
        margin: size === 'half' ? '0 2px 2px 0' : '0 0px',
        border,
        borderRadius: size === 'half' ? '4px' : '8px',
        display: 'inline-block',
        width: `${width}px`,
        height: `${height}px`,
        backgroundImage: `url(${tileMap})`,
        backgroundPosition,
        backgroundSize,
        boxSizing: 'border-box',
        backgroundColor: '#fff',
        overflow: 'hidden',
        verticalAlign: 'middle',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border 0.15s',
        ...style,
      }}
    >
      {(computedNumber || computedLabel) && (
        <span
          style={{
            position: 'absolute',
            top: labelTop,
            right: labelRight,
            fontSize,
            fontWeight: 'bold',
            color: computedBorderColor,
            textShadow: '1px 1px 2px #fff, 0 0 2px #fff',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {computedNumber ?? computedLabel}
        </span>
      )}
    </span>
  );
};