import React  from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

const SingUpScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');   

     

    const Register = async () => {
      const formdata = {
        email: email,
        password: password,
        username: username,
      };

      try {
        const res = await axios.post('http://localhost:3000/api/auth/register', formdata,{
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (res.data) {
          console.log('Registration successful:', res.data);
          navigator('/login'); // Redirect to login page after successful registration
        }
      } catch (error) {
        
      }
    }

    
    
    const handleSubmit = (e) => {
      e.preventDefault();
      Register();
      
    };
  
    // Define icons as simple SVG components
    const TwitterIcon = () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
      </svg>
    );
  
    const MessageIcon = () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
      </svg>
    );
  
    const GithubIcon = () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
      </svg>
    );
  
    const TwitchIcon = () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7"></path>
      </svg>
    );
  
    const YoutubeIcon = () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
      </svg>
    );
  
    // Main styles
    const styles = {
      container: {
        minHeight: '100vh',
        backgroundColor: '#1e1145',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      },
      nav: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        borderBottom: '1px solid #392e6d',
      },
      navLeft: {
        display: 'flex',
        alignItems: 'center',
      },
      logo: {
        height: '40px',
      },
      navLinks: {
        marginLeft: '32px',
        display: 'flex',
      },
      navLink: {
        color: 'white',
        textDecoration: 'none',
        marginRight: '24px',
        fontWeight: '500',
      },
      navRight: {
        display: 'flex',
        alignItems: 'center',
      },
      socialIcon: {
        marginLeft: '16px',
        cursor: 'pointer',
        color: '#63b3ed',
      },
      languageSelector: {
        border: '1px solid #4c4f65',
        borderRadius: '4px',
        padding: '4px 8px',
        display: 'flex',
        alignItems: 'center',
        marginLeft: '16px',
        cursor: 'pointer',
      },
      languageText: {
        fontSize: '14px',
        marginRight: '4px',
      },
      startButton: {
        backgroundColor: '#06b6d4',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        marginLeft: '16px',
        fontWeight: 'bold',
        fontSize: '14px',
      },
      mainContent: {
        display: 'flex',
        flex: 1,
        marginTop: '32px',
      },
      leftSide: {
        width: '50%',
        padding: '32px',
        display: 'flex',
        justifyContent: 'center',
      },
      benefitsCard: {
        backgroundColor: 'rgba(49, 46, 129, 0.7)',
        borderRadius: '8px',
        padding: '32px',
        maxWidth: '500px',
        backdropFilter: 'blur(8px)',
      },
      benefitsHeader: {
        textAlign: 'center',
        marginBottom: '32px',
      },
      benefitsTitle: {
        fontSize: '24px',
        fontWeight: 'bold',
        margin: 0,
      },
      benefitsSubtitle: {
        color: '#cbd5e0',
        margin: '8px 0 0 0',
      },
      rewardsContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '32px',
      },
      rewardCard: {
        backgroundColor: 'rgba(55, 65, 153, 0.8)',
        borderRadius: '8px',
        padding: '16px',
        border: '2px solid rgba(6, 182, 212, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      },
      rewardIcon: {
        height: '64px',
        width: '64px',
        backgroundColor: '#b45309',
        borderRadius: '4px',
        marginBottom: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      rewardTitle: {
        fontSize: '12px',
        textAlign: 'center',
      },
      checkmark: {
        height: '24px',
        width: '24px',
        backgroundColor: 'rgba(6, 182, 212, 0.3)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 'auto',
        paddingTop: '8px',
      },
      getPerksButton: {
        backgroundColor: '#06b6d4',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        fontWeight: 'bold',
      },
      buttonIcon: {
        marginRight: '8px',
      },
      rightSide: {
        width: '50%',
        padding: '32px',
        display: 'flex',
        justifyContent: 'center',
      },
      formContainer: {
        maxWidth: '400px',
        width: '100%',
      },
      formHeader: {
        textAlign: 'center',
        marginBottom: '24px',
      },
      formBrand: {
        color: '#06b6d4',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        margin: 0,
      },
      formTitle: {
        fontSize: '28px',
        fontWeight: 'bold',
        margin: '4px 0 0 0',
      },
      formGroup: {
        marginBottom: '16px',
      },
      label: {
        display: 'block',
        color: '#06b6d4',
        marginBottom: '8px',
        fontSize: '14px',
      },
      input: {
        width: '100%',
        padding: '12px',
        backgroundColor: 'white',
        color: '#2d3748',
        borderRadius: '4px',
        border: 'none',
        boxSizing: 'border-box',
      },
      darkInput: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#1a202c',
        color: 'white',
        borderRadius: '4px',
        border: 'none',
        boxSizing: 'border-box',
      },
      helpText: {
        fontSize: '12px',
        color: '#a0aec0',
        marginTop: '4px',
      },
      primaryButton: {
        width: '100%',
        backgroundColor: '#06b6d4',
        color: 'white',
        border: 'none',
        padding: '12px',
        borderRadius: '4px',
        cursor: 'pointer',
        marginTop: '16px',
        fontWeight: 'bold',
      },
      secondaryButton: {
        width: '100%',
        backgroundColor: '#4c51bf',
        color: 'white',
        border: 'none',
        padding: '12px',
        borderRadius: '4px',
        cursor: 'pointer',
        marginTop: '16px',
        fontWeight: 'bold',
      },
      divider: {
        textAlign: 'center',
        marginTop: '24px',
        marginBottom: '16px',
        position: 'relative',
        borderBottom: '1px solid #4a5568',
        paddingBottom: '8px',
      },
      dividerText: {
        backgroundColor: '#1e1145',
        padding: '0 16px',
        color: '#a0aec0',
      },
      footer: {
        fontSize: '14px',
        color: '#a0aec0',
        textAlign: 'center',
      },
      link: {
        color: '#06b6d4',
        textDecoration: 'none',
      }
    };
  
    return (
      <div style={styles.container}>
        {/* Navigation */}
        <nav style={styles.nav}>
          <div style={styles.navLeft}>
            <img 
              src="/api/placeholder/120/40" 
              alt="RavenQuest Logo" 
              style={styles.logo} 
            />
            <div style={styles.navLinks}>
              <a href="#" style={styles.navLink}>HOME</a>
              <a href="#" style={styles.navLink}>NEWS</a>
              <a href="#" style={styles.navLink}>LEADERBOARD</a>
              <a href="#" style={styles.navLink}>MEDIA KIT</a>
            </div>
          </div>
          <div style={styles.navRight}>
            <span style={styles.socialIcon}><TwitterIcon /></span>
            <span style={styles.socialIcon}><MessageIcon /></span>
            <span style={styles.socialIcon}><GithubIcon /></span>
            <span style={styles.socialIcon}><TwitchIcon /></span>
            <span style={styles.socialIcon}><YoutubeIcon /></span>
            <div style={styles.languageSelector}>
              <span style={styles.languageText}>EN</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
            <button style={styles.startButton}>
              START YOUR ADVENTURE!
            </button>
          </div>
        </nav>
  
        {/* Main Content */}
        <div style={styles.mainContent}>
          {/* Left Side - Community Benefits */}
          <div style={styles.leftSide}>
            <div style={styles.benefitsCard}>
              <div style={styles.benefitsHeader}>
                <h2 style={styles.benefitsTitle}>JOIN OUR COMMUNITY</h2>
                <p style={styles.benefitsSubtitle}>AND ENJOY THESE EXCLUSIVE REWARDS</p>
              </div>
              
              <div style={styles.rewardsContainer}>
                {/* Reward Card 1 */}
                <div style={styles.rewardCard}>
                  <div style={{...styles.rewardIcon, backgroundColor: '#b45309'}}>
                    <img src="/api/placeholder/32/32" alt="Scroll" />
                  </div>
                  <p style={styles.rewardTitle}>Exclusive Teasers & Events</p>
                  <div style={styles.checkmark}>✓</div>
                </div>
                
                {/* Reward Card 2 */}
                <div style={styles.rewardCard}>
                  <div style={{...styles.rewardIcon, backgroundColor: 'rgba(237, 137, 54, 0.3)'}}>
                    <img src="/api/placeholder/32/32" alt="Companion" />
                  </div>
                  <p style={styles.rewardTitle}>Exclusive Companion</p>
                  <div style={styles.checkmark}>✓</div>
                </div>
                
                {/* Reward Card 3 */}
                <div style={styles.rewardCard}>
                  <div style={{...styles.rewardIcon, backgroundColor: '#c05621'}}>
                    <img src="/api/placeholder/32/32" alt="Discord Badge" />
                  </div>
                  <p style={styles.rewardTitle}>Discord Badge</p>
                  <div style={styles.checkmark}>✓</div>
                </div>
              </div>
              
              <div style={{display: 'flex', justifyContent: 'center'}}>
                <button style={styles.getPerksButton}>
                  <span style={styles.buttonIcon}><GithubIcon /></span>
                  GET YOUR FREE PERKS
                </button>
              </div>
            </div>
          </div>
          
          {/* Right Side - Login Form */}
          <div style={styles.rightSide}>
            <div style={styles.formContainer}>
              <div style={styles.formHeader}>
                <p style={styles.formBrand}>Web Dungeon Dynasty</p>
                <h1 style={styles.formTitle}>Register</h1>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hidrabula1@gmail.com"
                    style={styles.input}
                    required
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="••••••••"
                    style={styles.input}
                    required
                  />
                </div>
                
                
               
                
                <button
                  type="submit"
                  style={styles.primaryButton}
                >
                  REGISTER
                </button>
                
                <button
                  type="button"
                  style={styles.secondaryButton}
                >
                  REGISTER A NEW ACCOUNT
                </button>
                
                <div style={styles.divider}>
                  <span style={styles.dividerText}>Already have an account?</span>
                </div>
                
               
                
                <p style={styles.footer}>
                  For other issues, email us at <a href="mailto:support@ravenquest.io" style={styles.link}>support@ravenquest.io</a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  };

export default SingUpScreen;