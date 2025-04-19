// eslint-disable-next-line no-unused-vars
import React from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import HelloWorld from "./GameSceen/HelloWord";
import PlayerHub from "./GameSceen/PlayerHub";
import DungeonRun from "./GameSceen/DungeonRun";
const App = () => {
	return (
		<div>
			<Router>
				<Routes>
					<Route path="/test" exact element={<HelloWorld />} />
					<Route path="/dashboard" exact element={<PlayerHub />} />
					<Route path="/DungeonRun" exact element={<DungeonRun />} />
				</Routes>
			</Router>
		</div>
	);
};

export default App;
