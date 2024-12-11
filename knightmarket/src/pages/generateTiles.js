import React from 'react';

// Tile component to display each item
function Tile({ item }) {
  return (
    <div style={styles.tile}>
      <img src={item.image} alt={item.title} style={styles.image} />
      <div style={styles.details}>
        <h2>{item.title}</h2>
        <p>{item.description}</p>
      </div>
    </div>
  );
}

// Main component to generate tiles
function GenerateTiles({ listings }) {
  return (
    <div style={styles.grid}>
      {listings.map(item => (
        <Tile key={item.id} item={item} />
      ))}
    </div>
  );
}

const styles = {
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    justifyContent: 'center', // Center the grid
  },
  tile: {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '10px',
    width: '200px', // Increase width of the tile
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 'auto',
    borderRadius: '4px',
  },
  details: {
    marginTop: '10px',
  },
};

export default GenerateTiles;
