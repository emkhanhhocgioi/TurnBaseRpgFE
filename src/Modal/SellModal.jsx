import React, { useState } from 'react';
import axios from 'axios';
import { useEffect } from 'react';

const SellModal = ({ onClose, userdata,itemdata }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [weaponId, setWeaponId] = useState('');
    
    useEffect(() => {
        if (itemdata) {
            setName(itemdata.name || '');
            setWeaponId(itemdata._id || '');
            
        }
    }, [itemdata]);


    const handleSell = async () => {
        if (name && description && price && weaponId) {
            console.log('Selling Item:', { name, description, price, weaponId });

            const UserID = userdata._id;
            console.log(userdata)
            const token = localStorage.getItem('token');

            const item = {
                seller: userdata.walletAddress,
                name,
                weaponid: weaponId,
                description,
                price,
            };

            try {
                const res = await axios.post(
                    'http://localhost:3000/api/listitem',
                    { item },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                console.log('Sell response:', res.data);
                alert('Item listed to chain successfully!');
                setName('');
                setDescription('');
                setPrice('');
                setWeaponId('');
                onClose();
            } catch (error) {
                console.error('Sell failed:', error.response?.data || error.message);
                alert('Failed to sell item. Please try again.');
            }
        } else {
            alert('Please fill out all fields.');
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <button onClick={onClose} style={styles.closeButton}>&times;</button>
                <h2 style={styles.title}>Sell Item</h2>

                <label style={styles.label}>
                    Name: 
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={styles.input}
                    />
                </label>

                <label style={styles.label}>
                    Description:
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={styles.textarea}
                    />
                </label>

                <label style={styles.label}>
                    Price:
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        style={styles.input}
                    />
                </label>

                <label style={styles.label}>
                    Weapon ID:
                    <input
                        type="text"
                        value={weaponId}
                        onChange={(e) => setWeaponId(e.target.value)}
                        style={styles.input}
                    />
                </label>

                <div style={styles.actions}>
                    <button onClick={handleSell} style={styles.button}>Sell</button>
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
        width: '100%',
        padding: '10px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#2c2b40',
        color: '#fff',
        marginTop: '5px',
    },
    textarea: {
        width: '100%',
        padding: '10px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#2c2b40',
        color: '#fff',
        marginTop: '5px',
        resize: 'none',
        height: '80px',
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

export default SellModal;
