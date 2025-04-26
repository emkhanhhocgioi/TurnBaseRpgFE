import React, { useState } from 'react';
import axios from 'axios';

const CreateCharacter = ({ onClose , userdata}) => {
    const [characterName, setCharacterName] = useState('');
    const [characterClass, setCharacterClass] = useState('');
    

    const classes = ['Warrior', 'Mage', 'Rogue', 'Cleric'];
    
    const handleCreate = async () => {
        if (characterClass) {
            console.log('Character Created:', { characterName, characterClass });
           
            const UserID = userdata._id;
            const token = localStorage.getItem('token');
           
            console.log('Token:', token);
    
            const data = {
                characterClass: characterClass,
                UserID: UserID,
            };
    
            try {
                const res = await axios.post(
                    'http://localhost:3000/api/create/character',
                    data,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                console.log('Character creation response:', res.data);
                alert('Character created successfully!');
                setIsOpen(false);
                setCharacterName('');
                setCharacterClass('');
            } catch (error) {
                console.error('Character creation failed:', error.response?.data || error.message);
                alert('Failed to create character. Please try again.');
            }
    
        } else {
            alert('Please fill out all fields.');
        }
    };
    

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <button onClick={onClose} style={styles.closeButton}>&times;</button>
                <h2 style={styles.title}>Create Character</h2>

                <label style={styles.label}>
                    Create your character :
                   
                </label>
                
                <div style={styles.statBox}>
                    {characterClass === "Warrior" && (
                        <>
                        <div style={{
                            width: '100%',
                            height: '200px',
                            backgroundColor: '#2c2b40',
                            borderRadius: '8px',
                            marginBottom: '10px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            overflow: 'hidden',
                        }}>
                            <img
                            src="https://th.bing.com/th/id/OIP.DjJzH1rmt4aGYouKnQuZ6gHaHa?w=159&h=180&c=7&r=0&o=5&pid=1.7"
                            alt="Character"
                            style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover' }}
                            />
                        </div>

                        <div style={{
                            width: '100%',
                            borderRadius: '8px',
                            padding: '15px',
                            color: '#ccc',
                            backgroundColor: '#2c2b40',
                        }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>Character Stats</h4>
                            <p>Strength: 10</p>
                            <p>Agility: 8</p>
                            <p>Intelligence: 7</p>
                        </div>
                        </>
                    )}
                    </div>



                <label style={styles.label}>
                    Class:
                    <select
                        value={characterClass}
                        onChange={(e) => setCharacterClass(e.target.value)}
                        style={styles.select}
                    >
                        <option value="">Select a class</option>
                        {classes.map((cls) => (
                            <option key={cls} value={cls}>
                                {cls}
                            </option>
                        ))}
                    </select>
                </label>

                <div style={styles.actions}>
                    <button onClick={handleCreate} style={styles.button}>Create</button>
                    <button onClick={onClose} style={styles.secondaryButton}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9998,
    },
    modal: {
        backgroundColor: '#1c1a2e',
        padding: '30px',
        borderRadius: '20px',
        width: '400px',
        color: '#fff',
        position: 'relative',
        boxShadow: '0 0 15px rgba(0,0,0,0.4)',
    },
    closeButton: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'transparent',
        border: 'none',
        fontSize: '24px',
        color: '#fff',
        cursor: 'pointer',
    },
    title: {
        fontSize: '22px',
        marginBottom: '20px',
    },
    label: {
        width: '100%',
        display: 'block',
        marginBottom: '15px',
        fontSize: '14px',
        color: '#ccc',
    },
    input: {
        width: '380px',
        padding: '10px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#2c2b40',
        color: '#fff',
        marginTop: '5px',
    },
    statBox: {
        display: 'flex',
        width: '100%',
        height: '400px',
        justifyContent: 'space-between',
        border: '1px solid #444',
        borderRadius: '8px',
        marginBottom: '15px',
    },
    select: {
        width: '100%',
        padding: '10px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#2c2b40',
        color: '#fff',
        marginTop: '5px',
    },
    actions: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '20px',
    },
    button: {
        backgroundColor: '#1abc9c',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '10px',
        color: '#fff',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    secondaryButton: {
        backgroundColor: '#34495e',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '10px',
        color: '#fff',
        cursor: 'pointer',
    },
};

export default CreateCharacter;
