import Router from './Router'
import Header from './pages/Header'

function App() {
    return (
        <div>
            <Header></Header>
            <div className='container mt-4'>
                <Router></Router>
            </div>
        </div>
    );
}

export default App;
