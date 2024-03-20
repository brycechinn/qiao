import React from 'react';
import './mod.scss';


export default function LoginModalContent({ onClose }) {
    const [username, tryUsername] = React.useState('');
    const [password, tryPassword] = React.useState('');

    const login = async (event) => {
        event.preventDefault();

        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        if (response.ok) {
            const data = await response.json();
            if (data.isBanned) {
                console.log('User is banned');
            } else {
                if(response.status < 400) {
                    console.log('User logged in successfully');
                    onClose();
                    document.location.reload();
                } else {
                    console.log('Something went wrong!');   
                }
            }
        } else {
            console.error('Failed to login user');
        }
    };

    return (
        <div className='modal-content'>
            <button className='xButton' onClick={onClose}>X</button>
            <h2>Login</h2>
            <form onSubmit={login} style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
            }}>
                <input type='text' name="username" className="mod-input" placeholder='Username' value={username} onChange={(e) => tryUsername(e.target.value)} required />
                <input type='password' name="password" className="mod-input" placeholder='Password' value={password} onChange={(e) => tryPassword(e.target.value)} required />
                <button type='submit' className="mod-succ-btn">Login</button>
            </form>
        </div>
    );
}