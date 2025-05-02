// eslint-disable-next-line no-unused-vars
import React from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";


import DungeonRun from "./GameSceen/DungeonRun";
import SingInScreen from "./Auth/Login";
import SingUpScreen from "./Auth/Register";
import PlayerHub from "./GameSceen/PlayerHub";
import Admin from "./admin/admin";
const App = () => {
	return (
		<div>
			<Router>
				<Routes>

					<Route path="/" exact element={<PlayerHub/>} />
					<Route path="/ad" exact element={<Admin/>} />
					<Route path="/login" exact element={<SingInScreen/>} />
					<Route path="/signup" exact element={<SingUpScreen/>} />
					<Route path="/dashboard" exact element={<PlayerHub />} />
					<Route path="/DungeonRun" exact element={<DungeonRun />} />
				</Routes>
			</Router>
		</div>
	);
};

export default App;
