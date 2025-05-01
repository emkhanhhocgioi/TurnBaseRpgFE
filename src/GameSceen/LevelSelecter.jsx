import React from 'react';

const LevelSelecter = () => {
    const levels = [
        { id: 1, name: '1', image: 'public/assets/UI/DoorLevel.jpg' },
        { id: 2, name: '2', image: 'public/assets/UI/DoorLevel.jpg' },
        { id: 3, name: '3', image: 'public/assets/UI/DoorLevel.jpg' },
        { id: 4, name: '4', image: 'public/assets/UI/DoorLevel.jpg' },
        { id: 5, name: '5', image: 'public/assets/UI/DoorLevel.jpg' },
        { id: 6, name: '6', image: 'public/assets/UI/DoorLevel.jpg' },
    ];

    const styles = {
        gridContainer: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem',
            padding: '1rem'
        },
        button: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '1.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            transition: 'background-color 0.2s',
            cursor: 'pointer'
        },
        buttonHover: {
            backgroundColor: '#f3f4f6'
        },
        imageContainer: {
            overflow: 'hidden',
            borderRadius: '0.5rem',
            border: '2px solid #3b82f6',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            marginBottom: '1rem'
        },
        image: {
            width: '6rem',
            height: '6rem',
            objectFit: 'cover'
        },
        textContainer: {
            marginTop: '0.5rem',
        },
        levelText: {
            fontSize: '1.125rem',
            fontWeight: '600'
        }
    };

    return (
        <div style={styles.gridContainer}>
            {levels.map((level) => (
                <button
                    key={level.id}
                    style={styles.button}
                    onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor;
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '';
                    }}
                >
                    <div style={styles.imageContainer}>
                        <img
                            src={level.image}
                            alt={`Level ${level.name}`}
                            style={styles.image}
                        />
                    </div>
                    <div style={styles.textContainer}>
                        <span style={styles.levelText}>Level {level.name}</span>
                    </div>
                </button>
            ))}
        </div>
    );
};

export default LevelSelecter;