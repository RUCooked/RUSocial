import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { House, Shop, ChatSquareText, ChatDots, PersonCircle } from 'react-bootstrap-icons';

const NavigationBar = () => {
    const location = useLocation();
    const { user, signOut } = useAuthenticator();
    const currentPath = location.pathname;

    const isActive = (path) => {
        if (path === '/') {
            return currentPath === '/';
        }
        return currentPath.startsWith(path);
    };

    return (
        <Navbar bg="danger" variant="dark" expand="lg" className="py-2">
            <Container>
                {/* Logo and Brand */}
                <div className="d-flex align-items-center">
                    <img
                        src="https://a.espncdn.com/guid/3f06733d-8d8a-7044-6b24-e0ba817e25f0/logos/primary_logo_on_white_color.png"
                        alt="Rutgers Logo"
                        className="d-inline-block align-top me-3"
                        width="50"
                        height="50"
                    />
                    <div>
                        <Navbar.Brand as={Link} to="/" className="mb-0 h1">
                            KnightMarket
                        </Navbar.Brand>
                        <div className="text-light small d-none d-md-block">
                            Rutgers Forum & Marketplace
                        </div>
                    </div>
                </div>

                <Navbar.Toggle aria-controls="basic-navbar-nav" />

                <Navbar.Collapse id="basic-navbar-nav">
                    {/* Navigation Links */}
                    <Nav className="mx-auto">
                        <Nav.Link
                            as={Link}
                            to="/"
                            className={`d-flex align-items-center px-3 ${isActive('/') ? 'active fw-bold' : ''}`}
                        >
                            <House className="me-2" size={20} />
                            Home
                        </Nav.Link>
                        <Nav.Link
                            as={Link}
                            to="/marketplace"
                            className={`d-flex align-items-center px-3 ${isActive('/marketplace') ? 'active fw-bold' : ''}`}
                        >
                            <Shop className="me-2" size={20} />
                            Marketplace
                        </Nav.Link>
                        <Nav.Link
                            as={Link}
                            to="/forum"
                            className={`d-flex align-items-center px-3 ${isActive('/forum') ? 'active fw-bold' : ''}`}
                        >
                            <ChatSquareText className="me-2" size={20} />
                            Forum
                        </Nav.Link>
                        <Nav.Link
                            as={Link}
                            to="/messages"
                            className={`d-flex align-items-center px-3 ${isActive('/messages') ? 'active fw-bold' : ''}`}
                        >
                            <ChatDots className="me-2" size={20} />
                            Messages
                        </Nav.Link>
                    </Nav>

                    {/* User Profile Dropdown */}
                    <NavDropdown
                        title={<PersonCircle size={24} />}
                        id="basic-nav-dropdown"
                        align="end"
                    >
                        {user ? (
                            <>
                                <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/settings">Settings</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={signOut}>Sign Out</NavDropdown.Item>
                            </>
                        ) : (
                            <NavDropdown.Item as={Link} to="/login">Sign In/Sign Up</NavDropdown.Item>
                        )}
                    </NavDropdown>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavigationBar;


// import React from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
// import { House, Shop, ChatSquareText, ChatDots, PersonCircle } from 'react-bootstrap-icons';

// const NavigationBar = () => {

//     const location = useLocation();
//     const currentPath = location.pathname;

//     // Function to check if a path is active
//     const isActive = (path) => {
//         if (path === '/') {
//             return currentPath === '/';
//         }
//         return currentPath.startsWith(path);
//     };


//     return (
//         <Navbar bg="danger" variant="dark" expand="lg" sticky="top">
//             <Container>
//                 <div className="d-flex align-items-center">
//                     <img
//                         src="https://a.espncdn.com/guid/3f06733d-8d8a-7044-6b24-e0ba817e25f0/logos/primary_logo_on_white_color.png"
//                         alt="Rutgers Logo"
//                         className="d-inline-block align-top me-3"
//                         width="50"
//                         height="50"
//                     />
//                     <div>
//                         <Navbar.Brand as={Link} to="/" className="mb-0 h1">
//                             KnightMarket
//                         </Navbar.Brand>
//                         <div className="text-light small d-none d-md-block">
//                             Rutgers Forum & Marketplace
//                         </div>
//                     </div>
//                 </div>

//                 <Navbar.Toggle aria-controls="basic-navbar-nav" />

//                 <Navbar.Collapse id="basic-navbar-nav">
//                     <Nav className="mx-auto">
//                         <Nav.Link as={Link} to="/" className={`d-flex align-items-center px-3 ${isActive('/') ? 'active fw-bold' : ''}`}>
//                             <House className="me-2" size={20} />
//                             Home
//                         </Nav.Link>
//                         <Nav.Link as={Link} to="/marketplace" className={`d-flex align-items-center px-3 ${isActive('/marketplace') ? 'active fw-bold' : ''}`}>
//                             <Shop className="me-2" size={20} />
//                             Marketplace
//                         </Nav.Link>
//                         <Nav.Link as={Link} to="/forum" className={`d-flex align-items-center px-3 ${isActive('/forum') ? 'active fw-bold' : ''}`}>
//                             <ChatSquareText className="me-2" size={20} />
//                             Forum
//                         </Nav.Link>
//                         <Nav.Link as={Link} to="/messages" className={`d-flex align-items-center px-3 ${isActive('/messages') ? 'active fw-bold' : ''}`}>
//                             <ChatDots className="me-2" size={20} />
//                             Messages
//                         </Nav.Link>
//                     </Nav>

//                     {/* User Profile Dropdown */}
//                     {/* TODO: IMPLEMENT USER STATE MANAGEMENT FOR LOGGED IN / LOGGED OUT. 
//                     IE: IF THEY'RE LOGGED OUT IT SHOULD ONLY BE 'Login' IN THE DROPDOWN */}
//                     <NavDropdown
//                         title={<PersonCircle size={24} />}
//                         id="basic-nav-dropdown"
//                         align="end"
//                         className="me-2"
//                     >
//                         <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
//                         <NavDropdown.Item as={Link} to="/settings">Settings</NavDropdown.Item>
//                         <NavDropdown.Divider />
//                         <NavDropdown.Item as={Link} to="/logout">Log Out</NavDropdown.Item>
//                     </NavDropdown>
//                 </Navbar.Collapse>
//             </Container>
//         </Navbar>
//     );
// };

// export default NavigationBar;