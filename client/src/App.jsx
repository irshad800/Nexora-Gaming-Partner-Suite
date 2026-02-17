import { BrowserRouter as Router } from 'react-router-dom';

/**
 * Root Application Component
 * Routes and providers will be added in Phase 7
 */
function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-primary-600 mb-4">
                            Nexora Gaming
                        </h1>
                        <p className="text-gray-500 dark:text-dark-muted text-lg">
                            Partner Suite — Coming Soon
                        </p>
                    </div>
                </div>
            </div>
        </Router>
    );
}

export default App;
