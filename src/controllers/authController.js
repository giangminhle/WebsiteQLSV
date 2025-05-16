class AuthController {
    constructor() {
        this.users = []; // This would typically be replaced with a database
    }

    login(req, res) {
        const { username, password } = req.body;
        const user = this.users.find(user => user.username === username && user.password === password);
        
        if (user) {
            req.session.user = user; // Assuming session middleware is used
            res.status(200).json({ message: 'Login successful', user });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    }

    logout(req, res) {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ message: 'Logout failed' });
            }
            res.status(200).json({ message: 'Logout successful' });
        });
    }

    register(req, res) {
        const { username, password } = req.body;
        const existingUser = this.users.find(user => user.username === username);
        
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newUser = { username, password }; // In a real application, hash the password
        this.users.push(newUser);
        res.status(201).json({ message: 'User registered successfully' });
    }
}

export default new AuthController();