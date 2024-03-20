import React from 'react';
import './contact.scss';

const Contact = () => {
    return (
        <div className="contact-container">
            <h1>Contact Us</h1>
            <div className="centered-paragraph">
                <p>
                    If you're having any issues, questions, or feedback regarding our services, we're here to help! Our dedicated support team is available to assist you with any inquiries you may have. Please feel free to reach out to us using the contact information provided below.
                </p>
                <p>
                    Whether you have a technical problem, need assistance with your account, or simply want to provide feedback, we value your input and strive to provide the best possible experience for our users.
                </p>
                <p>
                    Our team is committed to responding to your inquiries promptly and providing you with the information and assistance you need. We appreciate your patience and understanding as we work to address your concerns.
                </p>
            </div>
            <form className='contactForm'>
                <h2>Contact Form</h2>
                <label htmlFor="name">Name:</label>
                <input type="text" id="name" name="name" placeholder="Enter your name" />
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" placeholder="Enter your email" />
                <label htmlFor="message">Message:</label>
                <textarea id="message" name="message" placeholder="Enter your message"></textarea>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default Contact;