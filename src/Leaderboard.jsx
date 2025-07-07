import React, { useState, useRef } from 'react';

const Leaderboard = (props) => {
  let scores = [...props.data].slice(0,3); // Limit to top 3 scores for display;
  let i = 0;
  while (i < scores.length && props.score <= Number(scores[i][1])) {
    i++;
  }

  const [you, setYou] = React.useState("✏️ You");
  const [save, setSave] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  const handleChange = (e) => {
    let name = e.target.value.toUpperCase();
    if (name.length > 0)
        setSave(true);
    else
        setSave(false);
    setYou(name);
  };

  const handleSave = () => { 
      setSave(false);
      setSaving(true);
      fetch('https://script.google.com/macros/s/AKfycbzyHTjlkj5aPXF2--2doG6e_raMwhWYWRKahV21eAc5-jpyIR0crOj-3p_M4_Q-1CA/exec?name='+you+'&score='+props.score, {
      method: 'POST'
        }).then(res => {
        setSaving(false);
        if (res.ok) { 
            return res.json();
        }
        else {
            console.error('Failed to save score: ', res.statusText);
            setFailed(true);
        }
    }).then(data => {
        if (data && data.success) {
            console.log(data.message);
            setSaved(true);
        }
        else {
            console.log(data.error);
            setFailed(true);
        }
    }).catch(err => {
            console.error('Error saving score:', err);
            setFailed(true);
    });
  };

  scores.splice(i, 0, [<td style={{textAlign: 'left'}}><input type='text' 
    maxLength={3} 
    value={you}
    disabled={saved} 
    onClick={!saved ? ()=>setYou("") : undefined} 
    onChange={handleChange}
    style={{
        maxWidth: '70px',
        padding: 0,
        margin: 0,
        fontSize: '16px',
        fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
        lineHeight: '1.5',
        outline: 'none',
        background: 'none',
        border: 'none',
        color: '#ffffffde',
        textShadow: '1px 1px 1px black'
    }}/>
    {save && !saved && <span style={{cursor: 'pointer'}} onClick={() =>handleSave()}>💾</span>}
    {saving && <span className='animate__animated animate__heartBeat animate__infinite' style={{display: 'inline-block'}}>⏳</span>}
    {failed && <span>❌</span>}
    {saved && <span>✅</span>}
    </td>, props.score.toString()]);
  scores.map( (row) => {
    // Convert name to jsx element
    if (typeof row[0] === 'string') {
        row[0] = <td style={{textAlign:'left'}}>{row[0]}</td>;
    }
    return row;
  });

  return (
    <div className="leaderboard">
        <table>
            <thead>
                <tr>
                <th colSpan='2' style={{textAlign:'center'}}>LEADERBOARD</th>
                </tr>
            </thead>
            <tbody>
                {scores.map((row, index) => (
                <tr key={index}>
                    {row[0]}
                    <td style={{textAlign:'right'}}>{row[1]}</td>
                </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
};

export default Leaderboard;