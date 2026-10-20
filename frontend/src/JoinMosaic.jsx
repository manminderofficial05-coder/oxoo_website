import React from 'react';

// 12 columns x 6 rows. Every box keeps its shape (P = leaf, C = circle, B = square)
// and uses a different person's photo as its background.
const PATTERN =
  'BBPBCBPBBCBP' +
  'BBCPBBBCPBBC' +
  'PBBBPCBBCPBB' +
  'CBBPBBCBBPCB' +
  'BPCBBPBCBBPC' +
  'BCBPBCBPBBCB';

const face = (n) => `https://i.pravatar.cc/120?img=${n}`;

export default function JoinMosaic() {
  return (
    <section className="join-users-mosaic-section">
      <div className="mosaic-container">
        <div className="mosaic-grid">
          {PATTERN.split('').map((t, i) => {
            const cls = { P: 'tile-purple', C: 'tile-circle', B: 'tile-blank' }[t];
            if (t !== 'B' || i % 3 === 0) {
              return <span key={i} className={`tile ${cls}`} />;
            }
            return (
              <span
                key={i}
                className={`tile tile-photo ${cls}`}
                style={{ backgroundImage: `url(${face((i % 70) + 1)})` }}
              />
            );
          })}
        </div>
        <div className="mosaic-center-pill">
          <h3 className="join-users-title">Join now</h3>
        </div>
      </div>
    </section>
  );
}
