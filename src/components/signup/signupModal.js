import React from 'react';
import './mod.scss';

export default function SignupModalContent({ onClose }) {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [email, setMail] = React.useState('')

    const signup = async (event) => {
        event.preventDefault();

        const response = await fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password,
                email
            })
        });

        if (response.ok) {
            console.log('User registered successfully');
            onClose();
        } else {
            console.error('Failed to register user');
        }
    };

    return (
        <div className='modal-content'>
            <button className='xButton' onClick={onClose}>X</button>
            <h2>Sign Up</h2>
            <form onSubmit={signup} style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
            }}>
                <input type="email" name="email" className="mod-input" placeholder="E-mail" value={email} onChange={(e) => setMail(e.target.value)} required />
                <input type='text' name="username" className="mod-input" placeholder='Username' value={username} onChange={(e) => setUsername(e.target.value)} required />
                <input type='password' name="password" className="mod-input" placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type='submit' className="mod-succ-btn">Sign Up</button>
            </form>
        </div>
    );
}